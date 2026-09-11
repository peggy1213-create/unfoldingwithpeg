Save as: src/content/posts/builder/data-model-is-the-product.en.md
title: "The data model is the product: why we don't do gamification"
tldr: ""Just add a little gamification" sounds like a UX call. It's actually an architectural one. This post uses our decision to reject gamification to unpack how post-centric and person-centric data models unfold into entirely different product logics — including what silent users mean, what hosts accumulate, and why gamification is a compensation mechanism, not an optional feature. The moat lives at the data-model layer."
description: ""Just add a little gamification" sounds like a UX call — it's actually architectural. A working PM's take on how the data model's centre determines everything downstream."
category: "Builder"
tags: ["product-thinking", "architecture", "community-design", "edtech", "learning-design"]
publishedAt: 2026-09-11
draft: false
lang: "en"
translationKey: "data-model-is-the-product"
A while back the team was discussing: "should we add a bit of gamification? Just a little — nudge people to write more reflections." It sounded like a pure UX call. Add it or don't, depending on aesthetics, user experience, brand voice.
But the more I sat with it, the more it felt off. Gamification isn't a UX option. It's an architectural inevitability. And rejecting it isn't a design preference — it's acknowledging that we're building a product on a different foundation.
I want to unpack this, because it applies to any product decision where you're deciding between "community tool" and "learning container" (or any similar opposition). A lot of debates that look like "should we add feature X" are really "where is our data model's centre" debates.
Two data architectures
Let me lay out both architectures clearly.
Post-centric. This is the foundation under Skool, Circle, Facebook Groups, Discord, LINE groups. The central object is the post, and users are the authors of posts. Your presence in a space equals the collection of things you've posted there. Move to another space and your presence starts from zero. Continuity attaches to the space, not to you as a person.
Person-centric. The path we chose. The central object is the activity (or Practice), and users are participants or hosts of activities. A user's identity equals the trail they've accumulated across all activities. Move to a new activity, take on a new role (from learner to host), and your trail is continuous, cumulative. Continuity attaches to the person, not to the space.
Looks like a subtle difference in "central object". But this choice unfolds into an entire product logic.
Three scenarios reveal the split
Scenario 1: someone quietly learns for three months without posting a single comment
In a post-centric architecture, this person is an "inactive user" — the system pushes notifications at them, the host's dashboard shows them as disengaged, they end up on the churn list.
In a person-centric architecture, this person might have written 90 reflections, done 3 Practices, sent 12 letters to their future self. They are a deep user. It's just that their depth is introverted, non-performative. The system should protect their rhythm, not harass them with "you haven't posted in three days".
Scenario 2: a host has run three cohorts and accumulated 60 learners
Post-centric view: the host's value is "their community has 60 members". But most of those 60 have probably stopped posting, and the host's asset is quietly depreciating.
Person-centric view: the host's value is "they have a concrete companionship trail with every single learner" — they can see what Ming did in cohort 1, how she grew in cohort 2, how she became someone else's buddy in cohort 3. That kind of relationship asset is something community tools can't produce.
Scenario 3: a learner decides to run their own activity
Post-centric: they need to spin up a separate space, build their community from zero, leave their previous posting history behind in the original space.
Person-centric: their previous trail as a learner doesn't disappear; the activity they run as a host is an extension of the same account. They can even use their own past reflections as templates to model for their new learners. Role-switching doesn't reset identity.
Gamification is architectural compensation, not a feature option
Back to gamification.
In a post-centric architecture, if you don't drive posting behavior with external incentives, the community goes quiet — because the system knows nothing about a user except "have they posted recently?" Silent equals nonexistent. Activity drops, hosts feel their ROI evaporating, renewal rates collapse, the business model goes with it.
Gamification is what this architecture inevitably develops in order not to collapse. Points, levels, leaderboards, daily check-ins, streaks — all of these mechanisms exist to force post output, because posts are the only "proof of user existence" this architecture recognizes.
In a person-centric architecture, a person's presence comes from their learning trail itself. Write a reflection, there's a trail. Do a Practice, there's a trail. Practice with someone else, there's a trail. Intrinsic motivation forms naturally; external incentive isn't needed. Bolting gamification on would pull the system's centre of gravity toward "externally-driven performative activity" — which is exactly the centre of gravity of the other architecture. It's an internal contradiction in the product logic.
So we reject gamification not because we think it's "bad", but because our architecture doesn't need it. Adding it would break the thing.
The moat lives at the architecture layer
There's a business implication here too.
If our differentiation lives only at the UI layer — colors, fonts, flows, copy — then Skool can copy it tomorrow. They have more resources, longer market history, more mature growth teams.
But architecture-level difference is the kind of thing you can only change by rewriting the product. Even if Skool removes all their gamification, copies every one of our buttons, their foundation is still post-centric. Their user identity still attaches to spaces, their growth flywheel still runs on posting density, their renewal logic is still "is the host's community active enough?"
The flip side: what we most need to guard against is not external competition. It's ourselves, chasing short-term KPIs, quietly stuffing community-tool mechanisms into a container architecture — add an activity score here, a leaderboard there, a push notification calling the non-posters back. Each step looks reasonable. Each step drags the data centre of gravity from "person" toward "post". A few steps in, we're no longer building the product we set out to build.
For other people building products: how to spot this kind of decision
These "looks like a feature debate, actually an architectural choice" moments usually have a few tells:
Someone proposes "just add a little X", where X is the core mechanism of a different product category (a community tool's leaderboard, an e-commerce coupon, a social app's notification aggression)
The argument is "users will be more active" rather than "users will feel more valuable" — the former serves the system, the latter serves the person
The dissenting voice can't articulate a specific reason, only "it feels off" — usually "feels off" is detecting an architectural conflict; the language just hasn't caught up yet
When you hit one of these moments, worth stopping and asking one question: what is our data centre? Will this feature reinforce that centre, or quietly pull the weight elsewhere?
The answer will often disqualify features that seemed perfectly reasonable — as in, "this doesn't belong in our product". That kind of refusal isn't conservatism. It's architectural discipline.
