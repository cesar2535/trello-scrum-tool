import { Storage } from "@plasmohq/storage";

async function setupBaseStorage() {
  const storage = new Storage();

  storage.watch({
    "cards-column-label": (c) => {
      console.log("cards-column-label", c);
    },
    make: (c) => {
      console.log("make", c);
    }
  });

  // The storage.set promise apparently resolves before the watch listener is registered...
  // So we need to wait a bit before adding the next watch if we want to split the watchers. Otherwise, the second watch will get the first set of change as well.
  await new Promise((resolve) => setTimeout(resolve, 470));
}

const main = async () => {
  // Wait for all the watch event to be processed
  await new Promise((resolve) => setTimeout(resolve, 1470));

  await setupBaseStorage();
};

main();
