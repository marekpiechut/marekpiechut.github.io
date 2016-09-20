---
layout: page
title: Blog
permalink: /blog/
idx: 0
---
<header class="post-header m-y-3">
  <h4 class="post-title text-center">{{ page.title }}</h4>
</header>

{% assign first_post = site.posts.first %}
<div class="m-b-1 row">
  <div class="col-md-12">
    <div class="border-underline" style="margin-bottom: 10px;">
      <a class="post-link link-black" href="{{ first_post.url | prepend: site.github.url }}">
          <h4 class="ellipsis">{{ first_post.title }}</h4>
      </a>
      <span class="text-muted text-small text-nowrap">{{ first_post.date | date: "%b %-d, %Y" }}</span>
    </div>

    <div class="post m-b-3">
      {{ first_post.content | strip_html | truncatewords:100}}


      {% if first_post.author %}
        {% include author-line-small.html author=page.author post=first_post%}
      {% elsif site.author %}
        {% include author-line-small.html author=site.author post=first_post%}
      {% endif %}
  </div>
</div>

<div class="row">
{% for post in site.posts offset:1 limit:2 %}
<div class="col-md-6 m-b-3">
  <div class="border-underline" style="margin-bottom: 10px;">
    <a class="post-link link-black" href="{{ post.url | prepend: site.github.url }}">
        <h4 class="ellipsis">{{ post.title }}</h4>
    </a>
  </div>

  <div class="post">
    {{ post.content | strip_html | truncatewords:50}}
    <div class="text-muted text-small">{{ post.date | date: "%b %-d, %Y" }}</div>

    {% if post.author %}
      {% include author-line-small.html author=page.author post=post%}
    {% elsif site.author %}
      {% include author-line-small.html author=site.author post=post%}
    {% endif %}
</div>
{% endfor %}
</div>

<div class="row">
  <hr />
</div>

{% for post in site.posts offset:3%}
<div class="row">
  <div class="col-xs-12 col-md-10 col-xs-12">
    <a class="post-link link-black" href="{{ post.url | prepend: site.github.url }}">
        <h4 class="">{{ post.title }}</h4>
    </a>
    <div class="text-small text-muted m-t-1">
      {{ post.content | strip_html | truncatewords:30 }}
    </div>
  </div>
  <div class="col-xs-12 col-md-2 text-muted text-small">{{ post.date | date: "%b %Y" }}</div>
</div>
<div class="row m-b-1">
  <hr />
</div>
{% endfor %}
