require 'yaml'

module Jekyll
  class LoadTranslations < Generator
    def generate(site)
      translations_path = File.join(site.source, 'src/yml/translations.yml')
      if File.exist?(translations_path)
        translations = YAML.load_file(translations_path)
        site.data['translations'] = translations
      end
    end
  end
end
