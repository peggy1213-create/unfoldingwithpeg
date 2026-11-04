---
title: "Being Ambitious with AI Is a Learning Problem"
tldr: "Felix Rieseberg names four kinds of AI ambition, speed, altitude, depth, range. The tactics are good, but the real blocker is self-efficacy, we don't try what we don't believe is possible. Bandura described four sources of that belief; Felix's stories cover three. The missing one, mastery experience, is the strongest, and it can be designed."
description: "AI ambition is a self-efficacy problem, and the strongest source of self-efficacy, mastery experience, is something we can design."
category: "AI"
tags: ["ai-ambition", "self-efficacy", "learning-design", "prompting", "peer-learning"]
publishedAt: 2026-11-04
draft: false
lang: "en"
translationKey: "ambition-with-ai-is-a-learning-problem"
---

Felix Rieseberg, an engineering manager at Anthropic, recently wrote [How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/). His starting point is a line people who build AI keep posting whenever they see something impressive, we're not ambitious enough. It's easy to post and hard to follow, so he wrote a tutorial.

## Four kinds of ambition

Felix splits ambition into four types. In my own words,

- **Speed**: the same work, done faster. The obvious one.
- **Altitude**: stop handing the model tasks and start handing it outcomes. Ask, what do I actually want to happen after this is done?
- **Depth**: do the task the way the best person in the field would, with their raw materials, their methods, and an outside check that the result is right.
- **Range**: bring in fields the task doesn't obviously need.

His running example is a quarterly business review deck. Let me translate it into my world.

Say I'm asked to design a half-day workshop on giving feedback for a group of new managers.

**Altitude**\
The low-altitude request is "draft an agenda and slides." One level up, "What should these managers do differently in their next three one-on-ones, and what would make that likely?" One more level, the workshop only exists so that new managers have better conversations with their teams. So ask the model to design a better way to get there than a one-off workshop, and run it alongside the workshop with one team for a month. Felix offers a useful tell, if you're going to hold meetings about the thing you're making, altitude is probably worth trying.

**Depth**\
A learning designer at the top of the field wouldn't start from a tidy "training needs analysis." They'd start from rawer material, anonymized engagement-survey comments, exit-interview notes, the questions managers actually bring to HR. They'd reach for deliberate practice and spaced follow-up rather than a slide deck. They'd test assumptions, "we think new managers lack feedback skills; check that against the raw data, maybe it's time or psychological safety." And they wouldn't trust the post-workshop smile sheet. The outside judge is behavior six weeks later, ideally reported by the people being managed. Felix's strongest point here is that last one, don't let the model grade itself.

**Range**\
Felix borrows a trick from *The Art of Innovation*, replace the noun with verbs. "A feedback workshop" becomes "helping people who dread conflict say something true to someone they'll see again tomorrow, without breaking the relationship." Now the useful fields come into view, an improv teacher, a hostage negotiator, a physical therapist who rebuilds strength through progressive load. His warning matters, don't ask the model to *write like* a negotiator. Ask it to *do what a negotiator does* to prepare for a hard conversation.

All of this is good advice. But the part that stayed with me is the end of his post.

## The real blocker is belief

Felix closes by asking why ambition is so hard in the first place, and lands on a concept from psychology, self-efficacy, our belief in our ability to succeed at something. People who believe they can do more try more, and accomplish more.

That idea has a lineage. Albert Bandura, who introduced it, described four sources that build self-efficacy,

1. **Mastery experiences**: having succeeded at something similar yourself.
2. **Vicarious experiences**: watching someone like you succeed.
3. **Verbal persuasion**: being told, credibly, that you can.
4. **Physiological and emotional states**: how anxious or calm you feel while trying.

Felix's stories map neatly onto three of them. George Dantzig solved two well-known open problems in statistics because he thought they were homework, the framing told him they were solvable (persuasion). The four-minute mile fell again soon after Roger Bannister broke it (vicarious experience). *The Inner Game of Tennis* argues you play worse when you're straining (emotional state).

There's a fun twist here. One of his depth tactics, set an unreasonable goal and tell the model it's perfectly reasonable, is verbal persuasion applied to the model. We're already doing self-efficacy work on AI. We just aren't doing it on ourselves.

And the source missing from his list is the one Bandura considered strongest, mastery experience. Nothing raises your belief that you can do the hard thing like having done a slightly-less-hard version of it.

That's the part learning designers know how to build.

## Designing your own mastery ladder

If ambition with AI is a self-efficacy problem, then "be more ambitious" isn't really advice. It's verbal persuasion, the weakest of the four sources. What works better is a sequence of small, real wins. Here's how I'd design one,

**Shrink the step, not the goal**\
Pick one task a week that you'd normally do on autopilot. Push it one notch on one axis, a little higher, a little deeper, or one new field. Look closely at Felix's quarterly-review example and you'll see he already structured it this way, each step slightly more ambitious than the last. That's a mastery ladder.

**Make the win real**\
Mastery only counts if the success is genuine. A model praising its own output isn't a win; a result that holds up against an outside check is. Felix's "outside judge" principle is also a self-efficacy principle, fake wins build fragile confidence.

**Keep a record**\
Write down what you asked before, what you asked this time, and what happened. Self-efficacy grows from success you can remember, and most of our AI wins vanish into chat history.

**Watch people like you, not people far above you**\
Vicarious experience works best when the person you're watching resembles you. A viral demo from a top engineer rarely changes what a teacher or an HR manager tries next week. A colleague in your own field, showing you their messy prompt and what came out, does. This is a big part of why I keep betting on peer learning, the most persuasive proof that you can do something is someone a lot like you who just did it.

**Lower the stakes on purpose**\
Give yourself a sandbox task where failing costs nothing. You'll explore more when you're not trying so hard.

## Closing

Felix notes that self-efficacy isn't a new problem, but it matters more when tools leap forward every few weeks. I agree, and I'd add one thing, the gap between what models can do and what we ask of them is not mainly a prompting gap. It's a learning gap. And learning gaps close the way they always have, one real, slightly-too-hard success at a time.

