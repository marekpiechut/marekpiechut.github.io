---
layout: page
title: Blog
permalink: /blog/
---

{% for post in site.posts %}
  <div>
    <div class="border-underline" style="display: flex; flex-direction: row; width: 100%; justify-content: space-between; margin-bottom: 10px;">
      <a class="post-link" href="{{ post.url | prepend: site.github.url }}">
          <h4>{{ post.title }}</h4>
      </a>
      <span class="text-muted text-small">{{ post.date | date: "%b %-d, %Y" }}</span>
    </div>

    <div class="post">
      {{ post.excerpt }}
      <span class="center"><a href="{{ post.url | prepend: site.github.url }}">...</a></span>
    </div>
  </div>
{% endfor %}
