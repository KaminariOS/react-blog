
---
title: "Ndots option explanation"
date: '2025-10-26'
tags: ['k8s', 'tailscale', 'DNS', 'Chatgpt']
draft: false
summary: 'What does the ndots option in DNS mean'
---
## Prompt:
cat /etc/resolv.conf
search cloudflared-tunnel.svc.cluster.local svc.cluster.local cluster.local tail79e65.ts.net lan
nameserver 10.43.0.10
options ndots:5

what does ndots mean

## Response:
In `/etc/resolv.conf`, the `options ndots:<number>` setting controls **how the system’s DNS resolver decides whether to treat a domain name as “absolute” or “relative”** when performing lookups.

* * *

### 🧩 Meaning of `ndots:5`

*   `ndots:5` means that **if a domain name has fewer than 5 dots (`.`)**, the resolver will **first try appending search domains** from the `search` line before attempting a direct lookup.

* * *

### 🔍 How It Works (Example)

Given your config:

```bash
search cloudflared-tunnel.svc.cluster.local svc.cluster.local cluster.local tail79e65.ts.net lan
options ndots:5
```

When you try to resolve, for example:

```bash
ping myservice
```

The resolver counts the dots in `myservice` (0 dots < 5), so it **tries these in order**:

1.  `myservice.cloudflared-tunnel.svc.cluster.local`
2.  `myservice.svc.cluster.local`
3.  `myservice.cluster.local`
4.  `myservice.tail79e65.ts.net`
5.  `myservice.lan`

If all fail, then it finally tries:

*   `myservice.` (with a trailing dot, meaning “absolute”)

* * *

### ⚙️ Why Kubernetes Uses `ndots:5`

In Kubernetes clusters, services are often addressed with long FQDNs like:

```
myservice.mynamespace.svc.cluster.local
```

Setting `ndots:5` ensures:

*   Short names like `myservice` get resolved **within the cluster search domains first**, avoiding unnecessary external DNS queries.
*   It reduces the chance of leaking internal names to upstream DNS resolvers.

* * *

### 📌 Summary

| Option | Meaning |
| --- | --- |
| `ndots:0` | Treat all names as absolute (no search domains used) |
| `ndots:1` | Default on most systems |
| `ndots:5` | Kubernetes default; only names with ≥5 dots are treated as absolute |

So, in your setup:  
`ndots:5` makes the resolver **favor cluster-local DNS resolution** before trying global DNS, which is standard for Kubernetes environments.

## Prompt:
this         service: http://rust-hello.default.svc.cluster.local.:3000 but         service: http://rust-hello.default.svc.cluster.local:3000 does not , why

## Response:
Excellent question — this difference comes down to how DNS resolvers and URL parsers handle **the trailing dot (`.`)** in a Fully Qualified Domain Name (FQDN).

Let’s break it down carefully:

* * *

🔹 The trailing dot in DNS
--------------------------

In DNS, a **trailing dot** means “this is an **absolute domain name**.”  
Without the dot, the system may treat it as **relative**, depending on your `/etc/resolv.conf` settings — especially `search` and `ndots`.

*   `rust-hello.default.svc.cluster.local.` → **absolute** name
*   `rust-hello.default.svc.cluster.local` → **relative** name

* * *

🔹 What happens with and without the dot
----------------------------------------

Given your `/etc/resolv.conf`:

```bash
search cloudflared-tunnel.svc.cluster.local svc.cluster.local cluster.local tail79e65.ts.net lan
options ndots:5
```

And your service name:

```
rust-hello.default.svc.cluster.local
```

Let’s count the dots:

```
rust-hello.default.svc.cluster.local → 4 dots
```

Since `4 < ndots:5`, the resolver treats it as **not fully qualified**, so it appends the search domains:

It will attempt DNS lookups in this order:

1.  `rust-hello.default.svc.cluster.local.cloudflared-tunnel.svc.cluster.local`
2.  `rust-hello.default.svc.cluster.local.svc.cluster.local`
3.  `rust-hello.default.svc.cluster.local.cluster.local`
4.  `rust-hello.default.svc.cluster.local.tail79e65.ts.net`
5.  `rust-hello.default.svc.cluster.local.lan`
6.  _finally_ `rust-hello.default.svc.cluster.local.`

This often fails unless one of those search domains happens to match.

* * *

🔹 Why the version with a trailing dot works
--------------------------------------------

When you use:

```
http://rust-hello.default.svc.cluster.local.:3000
```

The trailing dot tells the resolver:

> "This is a fully qualified domain name — do **not** append any search domains."

So the resolver directly queries DNS for `rust-hello.default.svc.cluster.local.`, which exists in your cluster DNS, and it works.

* * *

🔹 TL;DR — The root cause
-------------------------

| Form | Treated as | Behavior |
| --- | --- | --- |
| `rust-hello.default.svc.cluster.local` | _relative_ | Search domains appended → may fail |
| `rust-hello.default.svc.cluster.local.` | _absolute_ | Queries correct FQDN → works |

* * *

✅ Fix options
-------------

### Option 1: Use the trailing dot

Always use the trailing dot in internal URLs:

```
http://rust-hello.default.svc.cluster.local.:3000
```

### Option 2: Lower `ndots`

If you control the pod or container’s DNS config, you can override `ndots` to a smaller number (e.g., `ndots:1`) via `dnsConfig` in your Pod spec. That way, names with multiple dots are treated as absolute:

```yaml
dnsConfig:
  options:
    - name: ndots
      value: "1"
```

* * *

Would you like me to show a minimal Kubernetes YAML example of how to set `ndots:1` for a specific Deployment?

---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)
