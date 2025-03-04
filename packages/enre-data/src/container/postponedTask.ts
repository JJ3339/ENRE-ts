const createPostponedTaskContainer = () => {
  let pt: any[] = [];

  return {
    add: (task: any, idx?: number) => {
      if(!idx){
        pt.push(task);
      }
      else{
        pt.splice(idx, 0, task);
      }
    },

    get all() {
      return pt;
    },

    reset: () => {
      pt = [];
    }
  };
};

export default createPostponedTaskContainer();
