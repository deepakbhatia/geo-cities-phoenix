// In-memory storage for MVP
let content = [];

export const getContent = (req, res) => {
  const cityContent = content.filter(c => c.cityId === req.params.cityId);
  res.json(cityContent);
};

export const createContent = (req, res) => {
  const { cityId, title, body, type } = req.body;
  const newContent = {
    id: String(content.length + 1),
    cityId,
    title,
    body,
    type,
    createdAt: new Date().toISOString()
  };
  content.push(newContent);
  res.status(201).json(newContent);
};
