// fetch request
const prowPaths = fetch("../data/combined.geojson").then((response) => response.json());

export default await prowPaths;