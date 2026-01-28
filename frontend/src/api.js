export async function fetchItems() {
  const res = await fetch("http://127.0.0.1:4000/items");
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}
