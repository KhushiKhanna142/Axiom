const users = [
  { username: 'alice', email: 'alice@axiom.dev', password: 'password123!' },
  { username: 'bob', email: 'bob@axiom.dev', password: 'password123!' }
];

async function create() {
  for (const u of users) {
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`Created ${u.username} successfully.`);
      } else {
        console.error(`Failed to create ${u.username}:`, data);
      }
    } catch (err) {
      console.error(`Error for ${u.username}`, err);
    }
  }
}

create();
