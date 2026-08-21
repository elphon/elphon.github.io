#!/usr/bin/env ruby
# frozen_string_literal: true

require 'date'
require 'set'
require 'yaml'

GRID_COUNTS = {
  'statement' => 1,
  'wide' => 1,
  'pair' => 2,
  'lead-two' => 3,
  'two-lead' => 3,
  'trio' => 3,
  'lead-two-wide' => 4,
  'wide-two-lead' => 4,
  'lead-four' => 5,
  'four-lead' => 5
}.freeze

VARIANTS = {
  'statement' => %w[normal wide],
  'trio' => %w[line wave-up wave-down],
  'lead-four' => %w[normal wide],
  'four-lead' => %w[normal wide]
}.freeze

BLEND_GRIDS = %w[pair statement].freeze
AUTO_ORDER_GRIDS = %w[lead-two-wide wide-two-lead].freeze
STRICT = ENV['PHOTO_VALIDATE_STRICT'] == '1'

Warning = Struct.new(:path, :message)
Error = Struct.new(:path, :message)

warnings = []
errors = []

paths = ARGV.empty? ? Dir['_posts/*.{md,markdown}'].sort : ARGV

paths.each do |path|
  source = File.read(path, encoding: 'UTF-8')
  next unless source.start_with?("---\n")

  closing = source.index("\n---\n", 4)
  next unless closing

  front_matter = source[4...closing]
  data = YAML.safe_load(front_matter, permitted_classes: [Date, Time], aliases: true) || {}
  next unless data['layout'] == 'post-photo'

  photos = Array(data['photos'])
  sections = Array(data['photo_sections'])
  groups = Array(data['photo_groups'])

  photo_ids = photos.filter_map { |photo| photo.is_a?(Hash) ? photo['id'] : nil }
  duplicate_library_ids = photo_ids.group_by(&:itself).select { |_id, values| values.length > 1 }.keys
  duplicate_library_ids.each do |id|
    errors << Error.new(path, "duplicate photo library id: #{id}")
  end

  photo_id_set = photo_ids.to_set
  group_ids = groups.filter_map { |group| group.is_a?(Hash) ? group['id'] : nil }.to_set
  used_ids = []

  sections.each_with_index do |section, index|
    next unless section.is_a?(Hash)
    next if section['type'] == 'interlude'

    number = index + 1
    grid = section['grid'] || 'lead-two-wide'
    tone = section['tone'] || 'paper'
    order = section['order'] || 'manual'
    variant = section['variant']
    refs = Array(section['photos'])
    group = section['group']

    unless GRID_COUNTS.key?(grid)
      warnings << Warning.new(path, "section #{number}: unknown grid '#{grid}'")
    else
      expected = GRID_COUNTS.fetch(grid)
      if refs.length != expected
        warnings << Warning.new(path, "section #{number}: grid '#{grid}' expects #{expected} photos, got #{refs.length}")
      end
    end

    if group && !group_ids.include?(group)
      errors << Error.new(path, "section #{number}: unknown group '#{group}'")
    end

    refs.each do |id|
      unless photo_id_set.include?(id)
        errors << Error.new(path, "section #{number}: unknown photo id '#{id}'")
      end
      used_ids << id
    end

    if order == 'auto' && !AUTO_ORDER_GRIDS.include?(grid)
      warnings << Warning.new(path, "section #{number}: order:auto is only supported by #{AUTO_ORDER_GRIDS.join(' / ')}")
    end

    if variant
      supported = VARIANTS[grid]
      if supported.nil?
        warnings << Warning.new(path, "section #{number}: grid '#{grid}' does not use variant '#{variant}'")
      elsif !supported.include?(variant.to_s)
        warnings << Warning.new(path, "section #{number}: unsupported #{grid} variant '#{variant}' (#{supported.join(', ')})")
      end
    end

    if tone == 'blend' && !BLEND_GRIDS.include?(grid)
      warnings << Warning.new(path, "section #{number}: tone:blend background is only generated for #{BLEND_GRIDS.join(' / ')}")
    end
  end

  duplicate_usage = used_ids.group_by(&:itself).select { |_id, values| values.length > 1 }.keys
  duplicate_usage.each do |id|
    errors << Error.new(path, "photo id used more than once in photo_sections: #{id}")
  end

  unused = photo_id_set - used_ids.to_set
  unless unused.empty?
    warnings << Warning.new(path, "unused photo ids: #{unused.to_a.sort.join(', ')}")
  end
end

warnings.each { |warning| warn "WARN  #{warning.path}: #{warning.message}" }
errors.each { |error| warn "ERROR #{error.path}: #{error.message}" }

puts "Photo post validation: #{errors.length} error(s), #{warnings.length} warning(s)."
exit 1 unless errors.empty?
exit 1 if STRICT && !warnings.empty?
