async function run() {
  try {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      console.log('NO API KEY');
      return;
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log(data.models?.map(m => m.name).join('\n') || data);
  } catch(e) {
    console.error(e);
  }
}
run();
