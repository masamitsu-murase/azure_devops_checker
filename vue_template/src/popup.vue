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

      <v-slide-group show-arrows center-active v-if="projects.length &gt; 1">
        <v-slide-item v-for="proj in projects" :key="`project-${proj}`">
          <v-btn
            class="mx-2 text-none"
            :class="{ primary: proj == project }"
            depressed
            @click.stop="selectProject(proj)"
          >
            <span class="d-inline-block text-truncate" style="max-width: 8em" :title="proj">
              {{ proj }}
            </span>
            <span>{{ projectReviewCountContent(proj) }}</span>
          </v-btn>
        </v-slide-item>
      </v-slide-group>

      <v-list two-line>
        <review-item-list
          review-title="My Pull Requests"
          :review-items="my_pull_requests"
          v-if="hasMyPullRequests()"
        />
        <review-item-list
          review-title="My Review Items"
          :review-items="my_review_items"
          v-if="hasMyReviewItems()"
        />
      </v-list>

      <v-overlay :value="updating">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <access-error-dialog v-model="dialog" />
    </v-card>
  </v-app>
</template>

<script>
import ReviewItemList from "./review-item-list.vue";
import AccessErrorDialog from "./access-error-dialog.vue";

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
    },
  },
  methods: {
    setUpdating: function (enable) {
      this.updating = enable;
    },

    hasMyPullRequests: function () {
      return this.my_pull_requests.length > 0;
    },

    hasMyReviewItems: function () {
      return this.my_review_items.length > 0;
    },

    findMyWorks: async function () {
      let all_works = await browser.runtime.sendMessage({
        type: "findMyWorks",
      });
      return new Map(all_works);
    },

    projectReviewCountContent: function (proj) {
      const { my_pull_requests, my_review_items } = this.my_works.get(proj);
      return `(${my_pull_requests.length}|${my_review_items.length})`;
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

  components: {
    ReviewItemList,
    AccessErrorDialog,
  },
};
</script>

<style scoped>
.v-list-item-threads {
  min-height: 40px !important;
}
</style>
