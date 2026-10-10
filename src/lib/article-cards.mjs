const presentation = {
  characters: { displayTitle: "Characters", action: "Meet the characters" },
  endings: { displayTitle: "Choices & endings", action: "Explore choices" },
};

export function topicCard(topic) {
  const display = presentation[topic.id];
  if (!display) throw Error("Unknown topic card identity: " + topic.id);
  return {
    id: topic.id,
    title: topic.title,
    lead: topic.introduction,
    image: topic.cover,
    path: "/" + topic.slug,
    ...display,
  };
}
