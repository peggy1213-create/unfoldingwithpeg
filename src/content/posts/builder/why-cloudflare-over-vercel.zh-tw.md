---
title: "為什麼我選 Cloudflare 而不是 Vercel"
tldr: "我最後選 Cloudflare 而不是 Vercel 來放個人網站，是因為之後想在網站上加一個聊天工具讓我可以「問我的網站」，而 Cloudflare 剛好把需要的元件都準備好了。Vercel 日常用起來還是比較舒服，我另一個網站就是放在 Vercel 上；如果只是要蓋一個單純的網站，Vercel 會是更好的選擇。"
description: "一個非技術背景的創業者怎麼幫個人網站選主機，為什麼最後選了 Cloudflare。"
category: "Builder"
tags: [cloudflare, vercel, astro, hosting, stack-choice, builder, non-technical-founder]
publishedAt: 2026-09-14
updatedAt: 2026-09-14
draft: false
lang: "zh-TW"
translationKey: "why-cloudflare-over-vercel"
---

在開始建 unfoldingwithpeg 這個個人網站之前，我卡在一個很基本的問題，網站要放在哪家公司的主機上? 我在 Cloudflare 跟 Vercel 之間猶豫。

最後我選了 Cloudflare。理由不是Cloudflare 比較好，而是我在未來使用上有一個具體的需求。

我另一個網站 [in-betweens.cc](https://in-betweens.cc) 就是放在 Vercel 上，用起來很順手，控制台我也很喜歡，部署零摩擦，也很容易看到網站數據。


## 決定性因素: 我未來想加的功能

我打算之後在這個網站上加一個聊天工具，讓我自己可以「問我的網站」，用我寫過的所有文章當作知識庫來回答問題。這不是上線就要有的功能，內容累積夠了再說。但主機選擇會決定這件事之後好不好做。

Cloudflare 有一整套現成的元件可以做這件事，一個資料庫存文章、一個能理解語意 (不只是關鍵字) 的搜尋引擎、一個負責回答問題的 AI 模型，而且這三個東西天生設計來一起用。

如果我把網站放 Vercel，之後做這個聊天機器人有兩條路， 一是切成兩家 (網站在 Vercel、聊天機器人在 Cloudflare)，要處理跨家的溝通跟兩套控制台；二是之後整個搬到 Cloudflare 來，等於做兩次。

現在多花一點時間學 Cloudflare (更精確地說，是讓 Claude Code 陪我一起學)，比之後搬家便宜。

## 什麼時候選 Vercel

**用 Vercel 的體驗比較舒服。** 控制台的介面更精緻，每次改網站都自動生一個預覽網址可以分享，這個功能真的很好用。

**Cloudflare 第一次上手比較慢。** 但要調的設定還是比較多。Claude Code 在初始設定上大概多花了半小時，比直接部署到 Vercel 會遇到的情況多一點。

如果我是在做一個單純的個人網站，沒有要加聊天機器人或其他後端功能，Vercel 會是完全合理的選擇，可能還更快上線。
