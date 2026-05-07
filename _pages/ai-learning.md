---
layout: archive
title: "AI-enabled Learning"
permalink: /ai-learning/
author_profile: true
---

I've spent years working with data, engineering systems, and studying how technology shapes society. But there's always been a gap between the things I *wanted* to build and the things I actually knew how to build — games, interactive visualisations, generative art, little tools that make people stop and think.

AI closed that gap for me. Not by doing the work *for* me, but by being a collaborator I can actually talk to. I use it excitedly — it genuinely unlocks creativity I didn't have access to before — and critically, because I know it gets things wrong, and understanding *why* is half the learning.

This page is my journal for that journey. Every project here started with curiosity and a "what if". Some are polished, some are experiments, some are gloriously unfinished. All of them taught me something. I hope they inspire you to build something too.

---

{% assign sorted_projects = site.ai_projects | sort: 'date' | reverse %}

{% if sorted_projects.size > 0 %}
<div class="ai-project-grid">
  {% for project in sorted_projects %}
  <div class="ai-card ai-card--{{ project.status }}">
    <div class="ai-card__header">
      <span class="ai-card__type-badge ai-card__type-badge--{{ project.type | downcase | replace: ' ', '-' }}">{{ project.type }}</span>
      {% if project.status == 'in-progress' %}<span class="ai-card__status-badge">🔨 In progress</span>
      {% elsif project.status == 'idea' %}<span class="ai-card__status-badge">💡 Coming soon</span>{% endif %}
    </div>
    {% if project.image %}
    <img src="{{ project.image }}" alt="{{ project.title }}" class="ai-card__img">
    {% endif %}
    <h3 class="ai-card__title"><a href="{{ project.url }}">{{ project.title }}</a></h3>
    <p class="ai-card__excerpt">{{ project.excerpt }}</p>
    <div class="ai-card__tools">
      {% for tool in project.tools %}<span class="ai-card__tool-tag">{{ tool }}</span>{% endfor %}
    </div>
  </div>
  {% endfor %}
</div>
{% else %}
<p><em>Projects loading... check back soon!</em></p>
{% endif %}
