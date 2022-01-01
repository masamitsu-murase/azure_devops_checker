<template>
  <v-app>
    <v-card width="500" height="800">
      <v-card-title
        class="headline indigo primary accent--text text--lighten-5"
      >
        <span class="headline">Azure DevOps Checker</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="openOptions">
          <v-icon>fa-cog</v-icon>
        </v-btn>
        &nbsp;
        <v-btn icon @click="refreshStatus">
          <v-icon>fa-sync</v-icon>
        </v-btn>
      </v-card-title>

      <v-slide-group show-arrows center-active v-if="projects.length > 1">
        <v-slide-item v-for="proj in projects" :key="`project-${proj}`">
          <v-btn
              class="mx-2"
              :class="{primary: proj == project }"
              depressed
              @click.stop="selectProject(proj)"
            >
              {{ projectSlideContent(proj) }}
            </v-btn>
        </v-slide-item>
      </v-slide-group>

      <v-list two-line>
        <template v-for="list_item in listItems()">
          <v-subheader
            v-show="list_item.show"
            v-text="list_item.title"
            :key="`sh-${list_item.title}`"
          ></v-subheader>

          <template v-for="item in list_item.pull_requests">
            <v-list-item
              v-if="item.threads.length == 0"
              :key="`ri-${item.pull_request.id}`"
            >
              <v-list-item-avatar>
                <v-img
                  :src="item.pull_request.createdBy._links.avatar.href"
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content class="py-2">
                <v-list-item-title>
                  <v-icon
                    dense
                    @click.stop="openPullRequest(item.pull_request)"
                  >
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
                    <v-icon
                      dense
                      @click.stop="openPullRequest(item.pull_request)"
                    >
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
                      thread.comments[thread.comments.length - 1].author._links
                        .avatar.href
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
        </template>
      </v-list>

      <v-overlay :value="updating">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <v-dialog v-model="dialog" max-width="400">
        <v-card>
          <v-card-title class="headline error">Error</v-card-title>

          <v-card-text>
            Error occurred while accessing Azure DevOps.<br />
            Please check the followings:
            <ul>
              <li>You have already logged in to Azure DevOps.</li>
              <li>Your organization, project, and user id are correct.</li>
            </ul>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="dialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-app>
</template>

<script>
export default {
  data: function () {
    return {
      project: "",
      my_works: new Map(),
      updating: false,
      dialog: false,
    };
  },
  computed: {
    projects: function () {
      return Array.from(this.my_works.keys());
    },
    my_pull_requests: function () {
      if (this.my_works.has(this.project)) {
        const my_work = this.my_works.get(this.project);
        return my_work.my_pull_requests;
      } else {
        return [];
      }
    },
    my_review_items: function () {
      if (this.my_works.has(this.project)) {
        const my_work = this.my_works.get(this.project);
        return my_work.my_review_items;
      } else {
        return [];
      }
    }
  },
  methods: {
    listItems: function () {
      return [
        {
          show: this.hasMyPullRequests(),
          title: "My Pull Requests",
          pull_requests: this.my_pull_requests,
        },
        {
          show: this.hasReviewItems(),
          title: "My Review Items",
          pull_requests: this.my_review_items,
        },
      ];
    },

    openPullRequest: function (pull_request) {
      const url = `${pull_request.repository.webUrl}/pullrequest/${pull_request.pullRequestId}`;
      window.open(url, "_blank");
    },

    hasMyPullRequests: function () {
      return this.my_pull_requests.length > 0;
    },

    setUpdating: function (enable) {
      this.updating = enable;
    },

    hasReviewItems: function () {
      return this.my_review_items.length > 0;
    },

    findMyWorks: async function () {
      let all_works = await browser.runtime.sendMessage({ type: "findMyWorks" });
      return new Map(all_works);
    },

    projectSlideContent: function (proj) {
      const { my_pull_requests, my_review_items } = this.my_works.get(proj);
      return `${proj} (${my_pull_requests.length}|${my_review_items.length})`;
    },

    refreshStatus: function () {
      const vm = this;
      (async function () {
        try {
          vm.setUpdating(true);
          const my_works = await vm.findMyWorks();
          vm.my_works = my_works;
          if (!my_works.has(vm.project)) {
            vm.project = vm.projects[0];
          }
        } catch (e) {
          vm.setUpdating(false);
          vm.dialog = true;
          console.log(e);
        } finally {
          vm.setUpdating(false);
        }
      })();
    },

    openOptions: function () {
      (async function () {
        await browser.runtime.openOptionsPage();
        window.close();
      })();
    },

    selectProject: function (proj) {
      this.project = proj;
    },
  },
  created: function () {
    const vm = this;
    vm.refreshStatus();
  },
};
</script>

<style scoped>
.v-list-item-threads {
  min-height: 40px !important;
}
</style>
