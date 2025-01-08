<template>
  <div id="app">
    <h1>URL Shortener</h1>
    
    <div>
      <input v-model="originalUrl" type="text" placeholder="Введите URL" />
      <button @click="shortenUrl">Сократить</button>
    </div>

    <div v-if="shortUrl">
      <p>Сокращенная ссылка: <a :href="shortUrl" target="_blank">{{ shortUrl }}</a></p>
    </div>

    <div v-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
    </div>

    <div>
      <input v-model="searchShortUrl" type="text" placeholder="Введите shortUrl для поиска" />
      <button @click="searchUrl">Найти</button>
    </div>

    <div v-if="foundUrl">
      <p>Найденная ссылка: <a :href="foundUrl.originalUrl" target="_blank">{{ foundUrl.shortUrl }}</a></p>
      <p>Оригинальный URL: {{ foundUrl.originalUrl }}</p>
      <p>Дата создания: {{ foundUrl.createdAt }}</p>
      <p>Количество кликов: {{ foundUrl.clickCount }}</p>
    </div>

    <div v-if="allUrls.length > 0">
      <h2>Все сокращенные ссылки</h2>
      <ul>
        <li v-for="url in allUrls" :key="url.shortUrl">
          <a :href="url.originalUrl" target="_blank">{{ url.shortUrl }}</a>
          <button @click="deleteUrl(url.shortUrl)">Удалить</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "App",
  setup() {
    const originalUrl = ref("");
    const shortUrl = ref("");
    const errorMessage = ref("");
    const searchShortUrl = ref("");
    const foundUrl = ref(null);
    const allUrls = ref([]);

    const shortenUrl = async () => {
      errorMessage.value = "";
      try {
        const response = await fetch("http://localhost:3000/shorten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ originalUrl: originalUrl.value }),
        });

        const data = await response.json();

        if (response.ok) {
          shortUrl.value = `http://localhost:3000/${data.shortUrl}`;
        } else {
          errorMessage.value = data.error || "Произошла ошибка при сокращении URL";
        }
      } catch (error) {
        errorMessage.value = "Ошибка сети: " + error.message;
      }
    };

    const searchUrl = async () => {
      errorMessage.value = "";
      try {
        const response = await fetch(`http://localhost:3000/shorten/${searchShortUrl.value}`);

        const data = await response.json();

        if (response.ok) {
          foundUrl.value = data;
        } else {
          errorMessage.value = data.error || "Ошибка при поиске ссылки";
        }
      } catch (error) {
        errorMessage.value = "Ошибка сети: " + error.message;
      }
    };

    const deleteUrl = async (shortUrl) => {
      if (confirm(`Вы уверены, что хотите удалить ссылку ${shortUrl}?`)) {
        try {
          const response = await fetch(`http://localhost:3000/shorten/${shortUrl}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (response.ok) {
            allUrls.value = allUrls.value.filter((url) => url.shortUrl !== shortUrl);
          } else {
            errorMessage.value = data.error || "Ошибка при удалении ссылки";
          }
        } catch (error) {
          errorMessage.value = "Ошибка сети: " + error.message;
        }
      }
    };

    const fetchAllUrls = async () => {
      try {
        const response = await fetch("http://localhost:3000/shorten");
        const data = await response.json();

        if (response.ok) {
          allUrls.value = data;
        } else {
          errorMessage.value = data.error || "Ошибка при получении списка ссылок";
        }
      } catch (error) {
        errorMessage.value = "Ошибка сети: " + error.message;
      }
    };

    fetchAllUrls();

    return {
      originalUrl,
      shortUrl,
      errorMessage,
      searchShortUrl,
      foundUrl,
      allUrls,
      shortenUrl,
      searchUrl,
      deleteUrl,
    };
  },
};
</script>

<style scoped>
#errorMessage {
  color: red;
}
</style>
