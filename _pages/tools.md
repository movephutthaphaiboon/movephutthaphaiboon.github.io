---
layout: archive
title: "Tools"
permalink: /tools/
author_profile: true
---

Small browser-based tools I built for my own work and want to share. Everything runs in your browser: your data is never uploaded anywhere.

---

<div class="ai-project-grid">
  {% for tool in site.data.tools %}
  <div class="ai-card">
    <div class="ai-card__header">
      <span class="ai-card__type-badge ai-card__type-badge--data-storytelling">{{ tool.type }}</span>
    </div>
    {% if tool.image %}
    <a href="{{ tool.url }}"><img src="{{ tool.image }}" alt="{{ tool.title }}" class="ai-card__img"></a>
    {% endif %}
    <h3 class="ai-card__title"><a href="{{ tool.url }}">{{ tool.title }}</a></h3>
    <p class="ai-card__excerpt">{{ tool.excerpt }}</p>
    <div class="ai-card__tools">
      {% for tag in tool.tags %}<span class="ai-card__tool-tag">{{ tag }}</span>{% endfor %}
    </div>
  </div>
  {% endfor %}
</div>
