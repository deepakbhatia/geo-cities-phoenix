// In-memory storage for MVP (replace with DB later)
let cities = [
  { id: '1', name: 'Silicon Valley', theme: 'tech', vibe: 'futuristic', pages: [] },
  { id: '2', name: 'Sunset Boulevard', theme: 'art', vibe: 'creative', pages: [] },
  { id: '3', name: 'Neon District', theme: 'cyberpunk', vibe: 'edgy', pages: [] }
];

export const getCities = (req, res) => {
  res.json(cities);
};

export const getCity = (req, res) => {
  const city = cities.find(c => c.id === req.params.id);
  if (!city) {
    return res.status(404).json({ error: 'City not found' });
  }
  res.json(city);
};

export const createCity = (req, res) => {
  const { name, theme, vibe } = req.body;
  const newCity = {
    id: String(cities.length + 1),
    name,
    theme,
    vibe,
    pages: []
  };
  cities.push(newCity);
  res.status(201).json(newCity);
};
