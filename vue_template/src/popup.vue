<template>
  <v-app>
    <v-card>
      <v-list two-line>
        <!-- my pull requests -->
        <v-subheader
          v-show="hasMyPullRequests()"
          v-text="'My Pull Requests'"
        ></v-subheader>

        <template v-for="(item, index) in my_pull_requests">
          <v-divider :key="index"></v-divider>
          <v-list-item :key="item.id">
            <v-list-item-avatar>
              <v-img :src="users[item.user_id].image"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
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

        <template v-for="(item, index) in review_items">
          <v-divider :key="index"></v-divider>
          <v-list-item :key="item.id">
            <v-list-item-avatar>
              <v-img :src="users[item.user_id].image"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{
                item.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-app>
</template>

<script>
export default {
  data: function () {
    return {
      my_pull_requests: [
        {
          id: "hoge",
          title: "Hoge",
          description: "This is a pen. This is an apple.",
          user_id: "6dfca89d-806c-4387-a03b-009e458cfaf9",
        },
      ],
      review_items: [
        {
          id: "hoge2",
          title: "Hoge2",
          description: "This is a pen. This is an apple.",
          user_id: "6dfca89d-806c-4387-a03b-009e458cfaf9",
        },
      ],
      users: {
        "6dfca89d-806c-4387-a03b-009e458cfaf9": {
          displayName: "Masamitsu MURASE",
          image:
            "https://dev.azure.com/masamitsu-murase/_api/_common/identityImage?id=6dfca89d-806c-4387-a03b-009e458cfaf9",
        },
      },
    };
  },
  methods: {
    hasMyPullRequests: function () {
      return this.my_pull_requests.length > 0;
    },

    hasReviewItems: function () {
      return this.review_items.length > 0;
    },

    refreshStatus: function () {
      (async function(){
        // window.TeamsPresenceChecker.refreshStatus(this);
        const organization = "masamitsu-murase";
        const project= "test";
        const pr_url = `https://dev.azure.com/${organization}/${project}/_apis/git/pullrequests?api-version=6.0`;
        const pull_requests = await (await fetch(pr_url, {credentials: "include"})).json();
        const promises = pull_requests.value.map(pr => {
          const repositoryId = pr.repository.id;
          const pullRequestId = pr.pullRequestId;
          const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/threads?api-version=6.0`;
          return fetch(url, {credentials: "include"});
        });

        const response = await Promise.all(promises);
        const results = (await Promise.all(response.map(req => req.json()))).map(x => x.value).flat();
        console.log(results);
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
