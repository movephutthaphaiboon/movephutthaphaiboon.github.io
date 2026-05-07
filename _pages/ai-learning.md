---
layout: archive
title: "AI-enabled Learning"
permalink: /ai-learning/
author_profile: true
---

I think it is time to make something concrete. I have been using AI in both my work and personal life for a couple of years, and right now, in May 2026, I cannot think of anything more exciting than exploring what AI can really do. Not just for reaching random goals, but for helping me understand the world better. I would also like to record this journey and share it with my peers.

My plan is to learn by creating, and to create by learning. Let us see how far AI can take me.

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
