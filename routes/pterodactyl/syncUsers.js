import pteroApi from '../../utils/pteroApi.js';

export async function getOrCreatePteroUser(email, discordUsername, discordId) {
  const users = await pteroApi.get('/users');
  let existing = users.data.data.find(u => u.attributes.email === email);

  if (existing) {
    return existing.attributes;
  }

  const usernameSlug = `${discordUsername.toLowerCase()}_${discordId.slice(0, 5)}`;
  const { data } = await pteroApi.post('/users', {
    email,
    username: usernameSlug,
    first_name: 'x',
    last_name: 'x'
  });

  return data.attributes;
}
