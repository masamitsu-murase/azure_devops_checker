<template>
  <v-app>
    <v-card width="500">
      <v-list two-line>
        <!-- my pull requests -->
        <v-subheader
          v-show="hasMyPullRequests()"
          v-text="'My Pull Requests'"
        ></v-subheader>

        <template v-for="item in my_pull_requests">
          <v-list-item :key="`pr-${item.id}`">
            <v-list-item-avatar>
              <v-img :src="item.createdBy._links.avatar.href"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-on:click.stop="openPullRequest(item)">{{
                item.title
              }}</v-list-item-title>
              <v-list-item-subtitle>{{
                item.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>

        <!-- review -->
        <v-subheader
          v-show="hasReviewItems()"
          v-text="'My Review Items'"
        ></v-subheader>

        <template v-for="item in my_review_items">
          <v-list-item
            v-if="item.threads.length == 0"
            :key="`ri-${item.pull_request.id}`"
          >
            <v-list-item-avatar>
              <v-img
                :src="item.pull_request.createdBy._links.avatar.href"
              ></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title
                v-on:click.stop="openPullRequest(item.pull_request)"
                >{{ item.pull_request.title }}</v-list-item-title
              >
              <v-list-item-subtitle>{{
                item.pull_request.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-group
            v-else
            :key="`ri-${item.pull_request.id}`"
            no-action
            :value="true"
          >
            <template v-slot:activator>
              <v-list-item-avatar>
                <v-img
                  :src="item.pull_request.createdBy._links.avatar.href"
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title
                  v-on:click.stop="openPullRequest(item.pull_request)"
                  >{{ item.pull_request.title }}</v-list-item-title
                >
                <v-list-item-subtitle>{{
                  item.pull_request.description
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="thread in item.threads"
              :key="`pr-${item.pull_request.id}-th-${thread.id}`"
            >
              <v-list-item-avatar>
                <v-img
                  :src="thread.comments[thread.comments.length - 1].author._links.avatar.href"
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
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
      </v-list>
    </v-card>
  </v-app>
</template>

<script>
export default {
  data: function () {
    return {
      my_pull_requests: [],
      my_review_items: [],
    };
  },
  methods: {
    openPullRequest: function (pull_request) {
      const url = `${pull_request.repository.webUrl}/pullrequest/${pull_request.pullRequestId}`;
      window.open(url, "_blank");
    },

    hasMyPullRequests: function () {
      return this.my_pull_requests.length > 0;
    },

    hasReviewItems: function () {
      return this.my_review_items.length > 0;
    },

    refreshStatus: function () {
      const vm = this;
      (async function () {
        const my_works = await vm.azure_devops.findMyWorks();
        vm.my_pull_requests = my_works.my_pull_requests;
        vm.my_review_items = my_works.my_review_items;
      })();
    },

    markAsRead: function (elem) {
      console.log(elem);
    },

    openOptions: function () {
      // window.TeamsPresenceChecker.openOptions();
    },
  },
  created: function () {
    const { organization, project, user_id } = AzureDevOps.defaultUser();
    this.azure_devops = new AzureDevOps(organization, project, user_id);
    this.refreshStatus();
  },
};
</script>

<style scoped>
nav {
  min-width: 350px;
  padding-left: 2em;
  padding-right: 2em;
}

.collection .collection-item.avatar {
  min-height: max-content;
}
</style>
