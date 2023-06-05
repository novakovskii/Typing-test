<template>
  <header class="header">
    <w-toolbar 
      class="px0 py6" 
      no-border
    >
      <div class="title3">_typing test</div>
      <div class="spacer"></div>
      <w-flex 
        no-grow 
        gap="3" 
        wrap
      >
        <w-select 
          :items="languages" 
          outline 
          fit-to-content
          v-model="languagesOptions"
          inner-icon-left="mdi mdi-translate"
          @input="onLanguageSelect"
        >Language</w-select>
        <w-select 
          :items="countries" 
          outline 
          fit-to-content
          v-model="countriesOptions"
          inner-icon-left="mdi mdi-earth"
          @input="onCountrySelect"
        >Country</w-select>
        <w-switch
          v-model="isDarkTheme"
          class="mt3 caption"
          @input="onThemeSwitch"
        >
          <template #thumb>
            <w-icon>
              {{ isDarkTheme ? 'mdi mdi-weather-night' : 'mdi mdi-white-balance-sunny' }}
            </w-icon>
          </template>
        </w-switch>
      </w-flex>
    </w-toolbar>
  </header>
  <main class="main mt8">
    <w-flex
      v-if="!isLoaded"
      justify-center
    >
      <w-progress circle></w-progress>
    </w-flex>
    <template v-else>
      <span class="title5">{{ title }}</span>
      <div class="body primary mt2">{{ date }}</div>
      <a 
        :href="link" 
        target="_blank" 
        class="d-iblock mt2"
      >
        <w-button
          color="primary" 
          outline
        >
          Link
          <w-icon class="ml2">mdi mdi-open-in-new</w-icon>
        </w-button>
      </a>
      <w-card class="body mt4 lh3">{{ sourceText }}</w-card>
      <w-textarea
        ref="textarea"
        no-autogrow
        placeholder="Type here"
        outline
        rows="10"
        class="mt3"
      >
      </w-textarea>
      <w-flex justify-end class="mt3">
        <w-button @click="setRandomNews(languagesOptions, countriesOptions, textLength)">
          <w-icon class="mr1">mdi mdi-refresh</w-icon>
          Regenerate
        </w-button>
      </w-flex>
    </template>
  </main>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      isLoaded: false,
      isDarkTheme: null,
      languages: [
        { 
          label: 'English',
          value: 'en'
        },
        { 
          label: 'Russian',
          value: 'ru'
        }
      ],
      countries: [
        { 
          label: 'All',
          value: 'all'  
        },
        { 
          label: 'Russia',
          value: 'ru'
        }
      ],
      languagesOptions: 'en',
      countriesOptions: 'all',
      title: '',
      date: null,
      link: '',
      sourceText: '',
      inputText: '',
      isStarted: false,
      isFinished: false,
      startTime: null,
      finishTime: null,
      totalTime: null,
      speed: null,
      url: 'https://newsdata.io/api/1/news?apikey=pub_206834a89204e0fc9393ef17d7f8ea0f5f4e9',
      textLength: 80
    }
  },
  methods: {
    onLanguageSelect () {
      localStorage.setItem('language', this.languagesOptions)
      this.loadNews()
    },
    onCountrySelect () {
      localStorage.setItem('country', this.countriesOptions)
      this.loadNews()
    },
    onThemeSwitch () {
      this.isDarkTheme ? this.$waveui.switchTheme('dark') : this.$waveui.switchTheme('light')
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light')
    },
    async fetchNews(language, country, callback) {
      this.isLoaded = false
      let response
      let news = []
      const pageCount = 1
      for (let i = 0; i < pageCount; i++) {  
        const nextPage = response?.nextPage
        const results = await fetch(this.url + 
          `&language=${language}` + 
          `${country !== 'all' ? '&country=' + country : ''}` + 
          `${nextPage !== undefined ? '&page=' + nextPage : ''}`)
        response = await results.json()
        news = news.concat(response.results)
      }
      callback(language, country, news);
    },
    onNewsFetch (language, country, news) {
      localStorage.setItem(`news_${language}_${country}`, JSON.stringify(news))
      this.isLoaded = true
    },
    loadNews () {
      const fetchDate = localStorage.getItem(`fetchDate_${this.languagesOptions}_${this.countriesOptions}`)
      if (!fetchDate) {
        this.fetchNews(this.languagesOptions, this.countriesOptions, this.onNewsFetch)
        localStorage.setItem(`fetchDate_${this.languagesOptions}_${this.countriesOptions}`, new Date())
      } else {
        const fetchDateWithoutTime = new Date(fetchDate).setHours(0, 0, 0, 0)
        const currentDateWithoutTime = new Date().setHours(0, 0, 0, 0)
        if (fetchDateWithoutTime !== currentDateWithoutTime) {
          this.fetchNews(this.languagesOptions, this.countriesOptions, this.onNewsFetch)
          localStorage.setItem(`fetchDate_${this.languagesOptions}_${this.countriesOptions}`, new Date())
        } else {
          this.isLoaded = true
          this.setRandomNews(this.languagesOptions, this.countriesOptions, this.textLength)
        }
      }
    },
    setRandomNews (language, country, textLength) {
      const news = JSON.parse(localStorage.getItem(`news_${language}_${country}`))
      const randomIndex = Math.floor(Math.random() * news.length)
      this.title = news[randomIndex].title
      const textArray = news[randomIndex].content.split(' ')
      textArray.splice(textLength)
      this.sourceText = textArray.join(' ') + '...'
      this.link = news[randomIndex].link
      this.date = news[randomIndex].pubDate
    }
  },
  mounted () {
    if (this.isLoaded) this.$refs.textarea.$refs.textarea.focus()
    //theme initialise
    const theme = localStorage.getItem('theme')
    if (!theme) {
      this.isDarkTheme = true
      localStorage.setItem('theme', 'dark')
      this.$waveui.switchTheme('dark')
    } else {
      this.isDarkTheme = theme === 'dark' ? true : false
      this.$waveui.switchTheme(theme)
    }
    //language initialise
    const language = localStorage.getItem('language')
    if (!language) {
      localStorage.setItem('language', this.languagesOptions)
    } else {
      this.languagesOptions = language
    }
    //country initialise
    const country = localStorage.getItem('country')
    if (!country) {
      localStorage.setItem('country', this.countriesOptions)
    } else {
      this.countriesOptions = country
    }
    //load news
    this.loadNews()
  }
}
</script>

<style>
  @font-face {
    font-family: 'JetBrainsMono';
    src: url("./fonts/JetBrainsMono-Light.woff2") format('woff2');
  }
  @font-face {
    font-family: 'JetBrainsMono';
    src: url("./fonts/JetBrainsMono-Regular.woff2") format('woff2');
  }
  #app {
    font-family: 'JetBrainsMono';
    max-width: 1000px;
    margin: auto;
    padding: 0 32px;
  }
</style>