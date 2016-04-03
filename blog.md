---
layout: page
title: Blog
permalink: /blog/
---
{% for post in site.posts %}
  <li>
      <a class="post-link" href="{{ post.url | prepend: site.github.url }}">
        {{ post.title }}
        <div class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</div>
      </a>
      <div class="post">
        {{ post.excerpt }}
        <div class="center"><a href="{{ post.url | prepend: site.github.url }}">...</a></div>
      </div>
  </li>
{% endfor %}
