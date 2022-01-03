<template>
  <div>
    <v-subheader>{{ reviewTitle }}</v-subheader>

    <template v-for="item in reviewItems">
      <v-list-item
        v-if="item.threads.length == 0"
        :key="`ri-${item.pull_request.id}`"
      >
        <v-list-item-avatar>
          <v-img :src="item.pull_request.createdBy._links.avatar.href"></v-img>
        </v-list-item-avatar>

        <v-list-item-content class="py-2">
          <v-list-item-title>
            <v-icon dense @click.stop="openPullRequest(item.pull_request)">
              fa-external-link-alt
            </v-icon>
            {{ item.pull_request.title }}
          </v-list-item-title>
          <v-list-item-subtitle>{{
            item.pull_request.description
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-group
        v-else
        :key="`ri-${item.pull_request.id}`"
        no-action
        :group="`ri-${item.pull_request.id}`"
        :value="true"
      >
        <template v-slot:activator>
          <v-list-item-avatar>
            <v-img
              :src="item.pull_request.createdBy._links.avatar.href"
            ></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>
              <v-icon dense @click.stop="openPullRequest(item.pull_request)">
                fa-external-link-alt
              </v-icon>
              {{ item.pull_request.title }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              item.pull_request.description
            }}</v-list-item-subtitle>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="thread in item.threads"
          :key="`pr-${item.pull_request.id}-th-${thread.id}`"
          class="v-list-item-threads"
        >
          <v-list-item-avatar class="my-0">
            <v-img
              :src="
                thread.comments[thread.comments.length - 1].author._links.avatar
                  .href
              "
            ></v-img>
          </v-list-item-avatar>

          <v-list-item-content class="py-1">
            <v-list-item-title>{{
              thread.comments[0].content
            }}</v-list-item-title>
            <v-list-item-subtitle>{{
              thread.comments[thread.comments.length - 1].content
            }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    reviewTitle: {
      type: String,
    },
    reviewItems: {
      type: Object,
    },
  },

  methods: {
    openPullRequest: function (pull_request) {
      const url = `${pull_request.repository.webUrl}/pullrequest/${pull_request.pullRequestId}`;
      window.open(url, "_blank");
    },
  },
};
</script>

<style scoped>
</style>
