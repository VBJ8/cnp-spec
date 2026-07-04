async function checkCnpPolicy(recipientEmail) {
  const domain = recipientEmail.split('@')[1];
  const txt = await resolveTxt(`_cnp.${domain}`);
  if (!txt) return { hasPolicy: false };

  const { endpoint } = parseCnpRecord(txt);
  const res = await fetch(`${endpoint}/policy/${recipientEmail}`);
  if (res.status === 404) return { hasPolicy: false };

  return { hasPolicy: true, policy: await res.json() };
}
