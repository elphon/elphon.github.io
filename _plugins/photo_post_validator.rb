# frozen_string_literal: true

module PhotoPostValidator
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
    'trio' => %w[line wave-up wave-down],
    'statement' => %w[normal wide],
    'lead-four' => %w[normal wide],
    'four-lead' => %w[normal wide]
  }.freeze

  SECTION_TONES = %w[paper mist soft dark blend].freeze
  GROUP_TONES = %w[paper sand sage sea dusk].freeze
  BLEND_GRIDS = %w[pair statement].freeze
  AUTO_ORDER_GRIDS = %w[lead-two-wide wide-two-lead].freeze

  module_function

  def validate(site)
    warnings = []

    site.posts.docs.each do |post|
      next unless post.data['layout'] == 'post-photo'

      validate_post(post, warnings)
    end

    warnings.each { |message| Jekyll.logger.warn('Photo layout:', message) }

    return if warnings.empty? || !site.config['photo_validation_strict']

    raise Jekyll::Errors::FatalException,
          "Photo layout validation failed with #{warnings.length} warning(s)."
  end

  def validate_post(post, warnings)
    label = post.relative_path || post.path
    photos = Array(post.data['photos'])
    groups = Array(post.data['photo_groups'])
    sections = Array(post.data['photo_sections'])

    photo_ids = photos.filter_map { |photo| photo.is_a?(Hash) ? photo['id'] : nil }
    duplicate_library_ids = duplicates(photo_ids)
    duplicate_library_ids.each do |id|
      warnings << "#{label}: duplicate photo library id `#{id}`."
    end

    known_photo_ids = photo_ids.to_h { |id| [id, true] }
    group_ids = groups.filter_map { |group| group.is_a?(Hash) ? group['id'] : nil }
    known_group_ids = group_ids.to_h { |id| [id, true] }

    groups.each do |group|
      next unless group.is_a?(Hash)

      tone = group['tone'] || 'paper'
      next if GROUP_TONES.include?(tone)

      warnings << "#{label}: group `#{group['id']}` uses unknown tone `#{tone}`. " \
                  "Supported: #{GROUP_TONES.join(', ')}."
    end

    arranged_ids = []

    sections.each_with_index do |section, index|
      next unless section.is_a?(Hash)
      next if section['type'] == 'interlude'

      section_number = index + 1
      grid = section['grid'] || 'lead-two-wide'
      tone = section['tone'] || 'paper'
      refs = Array(section['photos'])

      unless GRID_COUNTS.key?(grid)
        warnings << "#{label}: section #{section_number} uses unknown grid `#{grid}`."
        next
      end

      expected = GRID_COUNTS.fetch(grid)
      if refs.length != expected
        warnings << "#{label}: section #{section_number} grid `#{grid}` expects #{expected} photo(s), " \
                    "but has #{refs.length}."
      end

      refs.each do |photo_id|
        arranged_ids << photo_id
        next if known_photo_ids[photo_id]

        warnings << "#{label}: section #{section_number} references missing photo id `#{photo_id}`."
      end

      if section['group'] && !known_group_ids[section['group']]
        warnings << "#{label}: section #{section_number} references missing group `#{section['group']}`."
      end

      unless SECTION_TONES.include?(tone)
        warnings << "#{label}: section #{section_number} uses unknown tone `#{tone}`. " \
                    "Supported: #{SECTION_TONES.join(', ')}."
      end

      if tone == 'blend' && !BLEND_GRIDS.include?(grid)
        warnings << "#{label}: section #{section_number} uses `tone: blend` with `#{grid}`; " \
                    "blend background rendering is supported only by pair and statement."
      end

      validate_variant(label, section_number, grid, section['variant'], warnings)
      validate_order(label, section_number, grid, section['order'], warnings)
    end

    duplicates(arranged_ids).each do |photo_id|
      warnings << "#{label}: photo id `#{photo_id}` is used more than once in photo_sections."
    end
  end

  def validate_variant(label, section_number, grid, variant, warnings)
    return if variant.nil?

    supported = VARIANTS[grid]
    if supported.nil?
      warnings << "#{label}: section #{section_number} sets variant `#{variant}` on grid `#{grid}`, " \
                  'which does not use variants.'
      return
    end

    return if supported.include?(variant)

    warnings << "#{label}: section #{section_number} uses variant `#{variant}` on `#{grid}`. " \
                "Supported: #{supported.join(', ')}."
  end

  def validate_order(label, section_number, grid, order, warnings)
    return if order.nil? || order == 'manual'

    if order == 'auto' && AUTO_ORDER_GRIDS.include?(grid)
      return
    end

    warnings << "#{label}: section #{section_number} uses order `#{order}` on `#{grid}`. " \
                'Only lead-two-wide and wide-two-lead support order: auto.'
  end

  def duplicates(values)
    values.group_by(&:itself).select { |_value, entries| entries.length > 1 }.keys
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  PhotoPostValidator.validate(site)
end
