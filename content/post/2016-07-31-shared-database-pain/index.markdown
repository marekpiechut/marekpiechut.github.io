---
date: "2016-07-31T23:33:41Z"
tags:
- architecture
- microservices
title: Sharing database between services will hurt you

cover:
  image: images/cover.jpg

---


Sharing database between application services is one of worst and most common anti-patterns you can still see around.
It will hurt you in so many ways, yet it looks so nice and easy at the beginning.

## Going fast like crazy

In the beginning it looks like it makes you go fast. You can get all data in application by just querying same database. Every modification you do is immediately visible in other services. You get atomicity with database transactions. No need to really handle things like network failures, endpoint unavailability, timeouts, firewalls etc. You just build a nice old monolith, only deployed on many machines. Development is going fast and easy. Your developers throw new features like machine gun, but then...

## You release

...and after release, like after every release, some thing didn't work out as well as you expected. It's nothing big, just some minor things here and there, so you start fixing it.

You need to add new column to database. Simple stuff. DB migrations are ready and tested. Software is updated. Now time for deployment. You need to stop all services... Wait! What? All? Yes, all, you need to run DB migrations and you don't want to run them live.

And so you have lost one of advantages of dividing your application into many independent services. You can't update them separately. Every database change will now require shutdown of all services. Users of your app and APIs will have to handle it. You'll need to notify them upfront of any update and schedule them taking their's schedule into consideration. Of course you would also need to do it when stopping single service, but net effect is much smaller. It's not that bad though, you  leave it as is and live on. Then you need to do some...

## Incompatible changes to your database schema

Changes that will require update of database queries. Maybe it's a change required by performance degradation after database got some real data, maybe new requirements in one of services or you simply found a way to do something better.

Again, at first, everything looks easy. You update software. Database schema evolution scripts are ready. You're a professional, so everything is well tested and ready to be deployed. Operations do the update and... some other service starts failing. It's not totally dead, just one of the endpoints fail.
Of course you think its related to the last update. Last change is always first suspect. But first you need to get system up and running again.

Maybe you can do a quick revert of previous update. But it's not always easy. Sometimes reverting database migration is very hard and takes a lot of time. Hopefully you have prepared revert scripts before going with the update. If not, then this is probably moment when you learn that they are needed. Learn the hard way...

Sometimes update to queries in second service is straightforward and you can do it in few minutes, but when you add whole release cycle it might take few days. Few days of unplanned downtime is quite a lot. I wouldn't count on high bonuses afterwards.

After getting things back online you start to investigate. Things might be much easier if your services communicated via some network API. You could check logs or network traffic on updated service and see which client failed, maybe even get some error codes. Now you need to slowly check all changes that went into release (db/query updates might be only one thing on huge list of change log items).

After some time one of team members recalls, that some other service also uses same database table you have changed and might be affected. You find guilty service, fix code and prepare release.

Everything runs smoothly afterwards, but your manager expects you to create some mitigation plan to make such incidents less probable in the future. What can you do? You make sure, that in the future you release, test and install all services at once. Now release process is also huge and painful.

## And these other minor things
Remember that every update to you database causes downtime of all of your services. Depending on how you count your SLAs, it might cost you much. Every unplanned downtime or performance degradation of database system will make all your services unavailable.
Maintenance tasks you periodically run on database system, software and hardware updates, security patches, etc. All these will have to be done at the same time for all services.

I'ts also worth noticing, that probably every service database usage is somewhat different. Some of them mostly read, some write. Some use huge reporting queries running for very long time, some do simple CRUD operations based on IDs. There's no way you'll be able to optimize schema and indexes for all of them at the same time. Probably you'll end with a compromise that's equally bad for all usages. Good luck with query performance investigation. It will be hard.

Going back to software updates, they not always help with performance. Sometimes after updating database you see huge drop in response times due to slow queries. Usually these can be fixed with small changes in queries or messing with indexes, but do you want to do them all at once? Wouldn't it be easier to do it one service after another?

Finally you might get an idea, that maybe some other type of database might be more accurate for particular service. How are you going to do it if it shares database with some other service?

All this looks bad, but you might have got...

## Even worse idea
To share not only your database, but also entity classes as a common dependency. If shared database cause pain, this is an inner ring of hell.

Consider a case, when you update entity API because it makes using it easier in one of services. Of course you version your software and all other services can simply continue using old version. No need to update anything now. But then you need to also do some changes in the very same entity class for second service. How can you do it without first applying changes made for first in second code? There's no way you can isolate these changes. Only way is to fork entity project and keep two separate branches of code, but then you end up with separate entity dependencies.

Again, no way you can make API nice and cohesive for both services. You end up with bag of classes with unused APIs in both projects and no easy way to update them separately.

What you'll probably start doing in the future is keeping entity dependency at the same version for all services, so you're sure  everything is consistent. You'll start to introduce changes just to conform to new API of entities, without any functional change. It also means you do releases, that do not change anything, just to make sure that entities are in the same versions in all running services.

Of course you also end up using same technologies just to reuse entities, even if it does not make any sense.

## Database is an integral part of service
Remember, database is the most intimate part of your service. It's the part you need to keep most secured and do not allow anybody in. Even these corporate reporting tools. They also should go trough API of your services or have separate database that is filled by your application. It's always better to add some APIs or even whole service to support what outside world needs, or you'll end with sealed schema that's unchangeable for any reason.

Your services should have well defined APIs you wish to support and are going to keep compatible as long as it makes sense. You never know. Maybe you end up changing your database to bunch of CSV files in the end if it fits your needs better. For sure you don't want to search for everybody using your database before you can do any update to schema.
