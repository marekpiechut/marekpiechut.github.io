---
title: "Corne MX 3.0 Keyboard build guide"
author: "Marek Piechut"
date: 2021-06-23T10:18:38.801Z
lastmod: 2024-06-30T12:43:56Z

description: ""

subtitle: "Introduction"

image: images/2.jpeg
cover:
  relative: true 
  image: images/2.jpeg 
images:
 - "images/1.jpeg"
 - "images/2.jpeg"
 - "images/3.jpeg"
 - "images/4.jpeg"
 - "images/5.jpeg"
 - "images/6.jpeg"
 - "images/7.jpeg"
 - "images/8.jpeg"
 - "images/9.jpeg"
 - "images/10.jpeg"
 - "images/11.jpeg"
 - "images/12.jpeg"
 - "images/13.jpeg"
 - "images/14.png"
 - "images/15.png"
 - "images/16.jpeg"
 - "images/17.jpeg"
 - "images/18.jpeg"
 - "images/19.jpeg"


aliases:
    - "/corne-mx-3-0-keyboard-build-guide-9b5c7eff4178"

---

### Introduction

![image](images/1.jpeg#layoutTextWidth)


**⌨️ Typed with: Corne MX with Gateron Brown &amp; BM40 with ultra-light Gateron Clear**

This is a build guide for [Corne Keyboard (Crkbd)](https://github.com/foostan/crkbd) Cherry MX keyboard version 3.0.1 by [foostan](https://github.com/foostan). Original Japanese guide is available [here](https://github.com/foostan/crkbd/blob/master/corne-cherry/doc/v3/buildguide_jp.md). Unfortunately there’s no official guide in English for this particular version, but I’ve been recently building one of them, so here it is. Please keep in mind that this version is not a translation and I don’t have even slightest Japanese knowledge. So all what’s written here is based on my own experience and might differ from the official guide.

![image](images/2.jpeg#layoutTextWidth)
Keyboard done



### Before you start

Building a keyboard is not very difficult if you have previous experience with soldering or at least some tinkering skills and messed a bit with electronics. But if you have never soldered or played with electronics it might be best to pick up a YouTube tutorial on soldering first and play with some throwaway electronics you have. It’s possible in the beginning to overheat components and even destroy PCBs.

Before we start there’s one remark on my side. Please note that **you’re the only responsible person for all damage you do while following this guide. It’s not my fault if you break anything or burn yourself.** If you are not sure you can handle stuff described here on your own, don’t do it. Just order an assembled keyboard or find some qualified electronic engineer to do it for you.

### Required equipment

* **Soldering iron**

This has to be a pencil type soldering iron for small electronics with a precision tip. Don’t even try with a soldering gun. If you don’t have one I’d suggest that you get a basic soldering station with temperature setting. It will be much easier to work on LEDs if you can lower the temperature. It should not be much more expensive. If you’re going to get one, buy one with more power. It will heat up faster and thanks to temperature setting it will not fry things up.

* **Solder wire**

To make things easy get a thin one (0.5mm is best). Don’t be very cheap on it. Poor quality solder wire will make you swear a lot, while working with high quality one is a pleasure.

* **Soldering flux**

Just get a “_no clean SMD soldering flux_” liquid. The smallest amount available. It can be a pen or a bottle with tiny brush.

* **Desoldering pump**

Desoldering pump It’s not really required if you don’t do any mistakes. But if you do… you know… get it or you’ll have hard times.

* **Precision tweezers — reverse**

You can also try using straight ones if you already have them. You don’t need anything fancy. We won’t be doing any surgery here. Don’t start without them, using only your fingers with SMD components is a bit too much.

* **Black insulation tape**

You know… To insulate things.

* **Isopropyl alcohol (optional)**

To cleanup the board of the excessive flux. Not really needed if you have used a no clean one. It will leave small stains, but nothing major. If you’re using a case it won’t really be visible.

* **Black marker (optional)**

Just a waterproof black marker (or rather of a color matching your PCB)

* **Thick sand paper (optional)**

### Required parts

There are two ways to get required parts — get a full kit or assemble all parts yourself. It might be easier to just order a kit and have everything done for you. Getting everything on your own is not that difficult, but can take a bit more time. You can grab _gerber_ files from [here](https://github.com/foostan/crkbd/releases/tag/corne-cherry-v3.0.1) and order PCBs at one of Chinese suppliers (ex: [https://jlcpcb.com](https://jlcpcb.com/)). Rest of the parts should be available on Aliexpress or your local electronics shop. This is mostly common stuff. Maybe Pro Micros or OLEDs won’t be there. Here’s the stuff you need:




### Switches &amp; Keycaps

You need to pick correct type of switches for your build. They need to be MX compatible (so low profile ones won’t fit). If you are using a case with top cover you can use 3 or 5 pin switches. If you’re going to go without a case please select 5 pin ones. They will fit firmly into the board while 3 pin ones might disconnect and wobble around. There are also some switches that have a hole for LEDs. These will work best if you plan on using per-key lights.

![image](images/3.jpeg#layoutTextWidth)


You will be ok with anything that’s compatible: Gateron, Cherry, Kailh, Blue, Brown, Clear, Red, whatever. Just pick what you like, or get a switch tester and try them out before purchase.

For the keycaps you should be fine with anything that fits your taste and is **MX compatible**. Just pick something that looks cool.

### Final notes

Take a deep breath, do it well rested (I know, I know, you’ll be doing it through the night regardless of what I say) and let’s get started. Just please think twice and solder once. Some mistakes are easy to fix and some will take time. I’ll be adding remarks on how to fix mistakes and how hard it is to do. But it’s always faster and easier to not do them the first time. It’s also a good idea to read whole guide at least once before soldering anything, and then start following it step by step. This way you’ll know what should be the expected outcome before doing actual work.

### Prepare PCB

Unpack your PCBs and check for defects. It’s pretty rare that they’ll be not ok, but inspect them to find some obvious stuff (you know, like broken in half or something). You will have 2 different pieces, one for left and one for right hand part. You can start with any. Just remember that **side with white markings is the bottom**.

If you want to have nice, black edges on your PCB, use sand paper and remove leftovers of PCB breakaway connectors (small bumps on the edge), clean it up with alcohol and paint the edge with permanent marker. This way it will look better, especially in dark case.

![image](images/4.jpeg#layoutTextWidth)


Now cover your desk to not burn any holes in it and let’s get to the real work.

### Soldering diodes

**Temperature: 300–350℃  
Difficulty: medium  
How hard to fix: medium**

Setup your soldering iron to 300 ℃, wait for it to warm up and test on the soldering wire if it melts. Give it few more minutes if it doesn’t. Low power soldering irons need at least 5 minutes to heat up. If it’s still not melting increase temperature a bit and try again. Maybe you got a poor quality soldering wire, or temperature setting is not calibrated. As a rule, try to use lower temperatures whenever possible. This gives you more time before you overheat SMD components.

Diodes are these small black thingies that allow current flow in only one direction. There’s only one important thing here: ⚠️ **diodes are polarized**. You **must** solder them that line on diode is on the side with line on the PCB. Arrow points into direction of the white line on the diode. Please check twice before soldering the first one and re-check from time to time. Re-soldering one is not a problem, but redoing all 42 will not be fun.

![image](images/5.jpeg#layoutTextWidth)


—   
🤔 **Advice:** The best way to solder these for me is to first apply flux on contacts on the board. Then cover one contact for given diode with just a bit of solder. After that I would heat up the solder on the PCB until it melts and slide diode into it using tweezers.  
—

It’s faster to do it in batches. So, after getting comfortable with it, apply flux on 6 contacts, cover 6 with solder and solder 6 diodes on one side. Rotate the board and solder second contact in all 6. Just repeat until you’re done.

—   
💣 **How hard to fix:** diodes are not hard to fix or replace. They are also very cheap. If you get one wrong it should be 30 seconds to get it right. Just don’t get them all wrong.  
 —

### Soldering per-key LEDs

**Temperature: 250–280 ℃  
Difficulty: medium  
How hard to fix: medium**

Per key LEDs are easy to solder. They have a nice hole on the PCB, so they are easy to position and you don’t need to hold them in place while soldering. The only real issue is that they are **heat sensitive**. Just make sure you’re soldering with lowest possible temperature and don’t heat them longer than for 5 seconds. It should be more than enough. If you need to give it more time due to a mistake or something, just make a 30 seconds break and let it cool down. Also try to solder them near the leg end, not near the led itself. It should be enough to touch it for a second with a bit of solder on tip of your soldering pen. Just use flux and it should work.

They are also **positional** components, so make sure you get them right. There’s one shorter leg that is connected to spot with a small cutout. **Shorter leg goes to the corner marked on the board** and emitting part (transparent) goes into the hole — pointing towards the top of the PCB. They should fit and not move around when in place.

![image](images/6.jpeg#layoutTextWidth)


—   
🤔 **Advice:** My advice here is to just drop few LEDs in correct spots with tweezers, cover connectors with a bit of flux, press it gently with tip of tweezers and solder one side (2 legs) one by one. It should be a quick action, get some solder on tip of your soldering pen and touch end of the leg. Don’t worry, if you won’t get it right the first time, you’ll see it after connecting the keyboard and it will be easy to fix. Finish whole board on one side, rotate PCB and do the same on the other pair of legs.  
 —

Again, it’s faster to do it in batches. Drop all LEDs into one side, cover 2 rows with flux and solder. Cover next 2 rows, solder…

Just as a reminder, these components are **heat sensitive**. Use high quality soldering wire and low temperature. Don’t heat it up for long, take a break and let it cool down.

—   
💣 **How hard to fix:** LEDs are a bit harder to fix. You’ll need to use sucking pump, heat up solder and remove it from pins before pulling it off.  
 —

### Soldering underglow LEDs

**Temperature: 250–280 ℃  
Difficulty: medium+  
How hard to fix: medium**

The only reason this step is marked harder is that these LEDs don’t have long legs. This makes them a bit harder to solder correctly and easier to overheat. I hope you’ve got few spares, as there’s a chance you’ll break one or two. Except of that it’s similar to the per-key LEDs.

These are also **positional** components and are also **heat sensitive**. On one corner of the LED there’s a marker or a cut corner. This spot has to go into the white corner on the board.

![image](images/7.jpeg#layoutTextWidth)


—   
🤔 **Advice:** Cover connectors with flux first, then position the LED. Press it firmly with tip of the tweezers so it doesn’t move. Then solder only one leg and move to next LED so it has time to cool down.  
 —

These I would do one by one, each pin at a time. So solder the first leg, move to next LED, solder the first leg, etc. Finish whole board with only one leg in each then move to second leg. This way you give them some time to cool down. Also please make sure you’re not touching them with your soldering iron for **more than 5 seconds**. Just take a short break if you need to retry. It will cool down in 30 seconds and you can try again.

—   
💣 **How hard to fix:** For me these are a bit easier to replace than per-key ones. Just heat up each leg and suck solder with pump. It should be easier to have a firm catch with tweezers on these.  
 —

### Soldering hotswap sockets

**Temperature: 300–350 ℃  
Difficulty: easy  
How hard to fix: medium**

After all the LEDs and diodes, with their overheating problems, low temperature and tiny size, this will be an easy task. Sockets are big, hard to overheat and easy to position. The only thing to watch out for is to have them in place while soldering. Just press them firmly into the board and keep it pressed while soldering. You can even do it with your finger. This way you also make sure you won’t overheat them. If your finger burns, it means you’re too slow 🤪.

—   
🤔 **Advice:** Press sockets with your finger or tweezers when soldering, to make sure they are in place.  
 —

Start by dropping all sockets in place for whole board. Apply some flux on few of them and put your soldering iron tip with some solder straight into the hole over the PCB connector. Theres a small cut in the metal part of the socket, so solder will get through it and join it to the board. If you can’t get enough solder this way, just add it while soldering. Theres a lot of space now.

![image](images/8.jpeg#layoutTextWidth)


Finish the whole board with one side of the socket, then rotate the PCB and repeat on the other side. You should be done in no time.

—   
💣 **How hard to fix:** Not very hard, just use solder pump and pull it off while heating. But there should be no need to do it anyway. They’re hard to break.  
 —

### Soldering Pro Micro pins

**Temperature: 300–350 ℃  
Difficulty: easy  
How hard to fix: VERY HARD!**

This part is a bit tricky. It’s pretty easy to solder in the pins. They tend to sit firmly in the board and are impossible to overheat. But please make sure you solder it **on the correct side of the board**. Pins are cheap, but if you don’t have a hot air soldering station, they are **real pain to remove**. So make sure you have flipped the PCB to the other side. Pro Micro goes to the top of the board. All other parts we have been soldering till now were on the bottom. This is the side you want to be looking at:

![image](images/9.jpeg#layoutTextWidth)


Now put the pins in and flip the board. It might need a bit of force to get them in place, as we are inserting square pins into round holes 🤪.

We’ll be soldering on the bottom, but controller itself goes to the top. Please take a 5 minute break and **double check** that you have it right. This is really important.

.

.

.

⏱ After 5 minute break…

Now check again if you have everything right, apply some flux on both pin lanes, grab your soldering iron in one hand and soldering wire in second and solder each pin individually.

—   
🤔 **Advice:** It’s easiest to heat up the pin and apply wire so that it touches both: pin and iron tip. This way it will melt quickly and go to right spot. This should be like a walk in the park after all the stuff we’ve already done.  
 —

![image](images/10.jpeg#layoutTextWidth)


This is how it should look like from the bottom after soldering (sorry I don’t have a photo of the pins before soldering controller). You might also like to socket the Pro Micros instead of soldering them in. The Micro-USB connector on them is really fragile. Its soldered only on the surface and easy to break. I wanted mine to be as low as possible and couldn’t get sockets that were low enough. Also I am using a magnetic connector anyway, but maybe socketing is an option for you. [Here](https://docs.splitkb.com/hc/en-us/articles/360011263059-How-do-I-socket-a-microcontroller-) is a guide how you might want to do it.

—   
💣 **How hard to fix:** ⚠️ Watch out here. It’s really hard to desolder these if you don’t have a hot air station. You will spend quite some time fighting it, and then will have problems to fit new socket into the board, as it’s hard to clean the holes from all the solder. So **double check** and then check it once more. To make sure you have everything placed correctly before soldering.  
 —

### Soldering TRRS socket and reset switch

**Temperature: 300–350 ℃  
Difficulty: easy  
How hard to fix: medium**

![image](images/11.jpeg#layoutTextWidth)


You can start with one you like. They are both quite easy. The only thing that can go wrong is that you solder them **on the wrong side of PCB**. They both go on the top side — the same side as the microcontroller sockets. You also can’t solder them the wrong way. Tactile switch is not positional and TRRS connector simply won’t fit in any incorrect way. Just put them into the holes on the board. You can stick them in place with some tape, but I like to just keep my finger on it while soldering on the other side. Flip the board and apply some solder. You can use some flux to make it easier.

—   
💣 **How hard to fix:** Not very hard, just use solder pump on all the pins and pull it off. TRRS is a bit more work as it has more pins.  
 —

### Soldering OLED pins

**Temperature: 300–350 ℃  
Difficulty: easy  
How hard to fix: medium**

It’s basically the same as with the Pro Micro. Just make sure you’re doing it on the correct side of the PCB. Longer part of the ping should be located on the top side of the board. If you have the cover, it might be worth to just put the pins into the holes, screw spacers in and check if it fits. In my build spacers were 0.5mm short and I had to lower the pins a bit. You can just move the plastic part on the pins up and down by applying some force with small pliers.

![image](images/12.jpeg#layoutTextWidth)


### Programming Pro Micros (optional)

**Temperature: None  
Difficulty: easy  
How hard to fix: easy**

Now this step is a bit tricky, as we’re going to be shortening pins on the board manually. That’s why I marked it optional. You can do all this using reset button we have soldered into the main board, but it’s good to test our microcontrollers before soldering them in. Desoldering is a big pain here, we want to make sure they are working correctly. We’ll start with default firmware, as it has all the features enabled and we’ll be able to test our keyboard. You can flash anything you wan later on, but **don’t use the ‘_common_’ firmware from QMK configurator for now**. It has OLED support disabled and you might spend quite some time (as I did) trying to figure out why they don’t work.

But first a **BIG WARNING**:

—   
⚠️ Pro Micros are **sensitive to static current**. Its this small shock you sometimes feel when touching things out of metal. It can destroy your microcontroller. So before taking it from the antistatic bag and each time before you touch it, **touch something that’s out of metal and is grounded.** Your room radiator will be best. Sometimes you’ll feel the shock. That’s the one you saved your controller from.  
 —

Now grab the QMK toolbox here:

[Download QMK toolbox](https://github.com/qmk/qmk_toolbox/releases)

We will be using it to flash our controller. And base firmware here:

[Download CRKBD firmware](https://github.com/foostan/qmk_firmware-hex/releases/download/release-20201208/crkbd_rev1_common_via.hex)

(If link doesn’t work, just search for _‘crkbd_rev1_common_via.hex’_ on [this](https://github.com/foostan/crkbd/blob/master/doc/firmware_jp.md) site)

Connect your Pro Micro using Micro USB cable (be very gentle with it, this socket is very fragile). Start QMK toolbox app and:

* Click Open button and select downloaded _‘.hex’_ file.
* Make sure you have _‘atmega32u4’_ controller selected
* Use jumper wire or tweezers to short RST and GND pins on Pro Micro for a second. Make sure you don’t touch any other pieces of the board with your wire.
![image](images/13.jpeg#layoutTextWidth)


If you do it right, QMK toolbox should show a yellow message about that it detected your controller. It should look similar to what you see below:

![image](images/14.png#layoutTextWidth)


Device name might be different (depending on which Pro Micro clone you have), but there should be “_something connected_” 🤪.

Now press the **Flash** button and it should start baking firmware into your controller. The board will be in the programmable state only for few seconds, so if you get a “Device disconnected” warning, just short the RST and GND again. After few seconds, if the flashing was successful, you should see something like on the screen below:

![image](images/15.png#layoutTextWidth)


Now your Pro Micro should show up as a regular keyboard (HID device).

—   
🤔 **Advice:** This part might be a bit tricky. You really have to watch out not to touch any other part of the board with your wire or tweezers while shortening the pins. If you don’t feel like you want to do this, just connect the Pro Micros and check if LEDs on them lightens up. Probably they are all fine and you will be able to flash them when soldered in.  
 —

### Soldering Pro Micro controllers

**Temperature: 300–350 ℃  
Difficulty: easy  
How hard to fix: VERY HARD**

Now insert your controllers onto the pins on the board facing down. The socket and all chips on the controller board should face the main PCB. You should see the empty bottom of the Pro Micro when it’s on the board. Looking from the side, a Micro USB socket should almost touch the main PCB:

![image](images/16.jpeg#layoutTextWidth)


Make sure it’s in place and **double check if it’s positioned correctly**, desoldering it will be very painful. Apply some flux on both lanes of pins and solder each one of them, just like with the pins themselves.

—   
💣 **How hard to fix:** ⚠️ Watch out here. It’s really hard to desolder it if you don’t have a hot air station. You will spend quite some time fighting it, and then will have problems to fit new socket into the controller, as it’s hard to clean the holes from all the solder. So **double check** and then check it once more. To make sure you have everything placed correctly before soldering.  
 —

As you can see in the photo above. I have longer pins on one side. That’s because I’ve got it wrong and had to re-solder them. Didn’t have any more short pins and had to use a longer set. It was really pain in the a** to desolder it. Hope you’ll have it right the first time.

### Soldering OLEDs

**Temperature: 300–350 ℃  
Difficulty: easy  
How hard to fix: hard**

After you have your controllers in place it’s time to solder in the OLEDs. First **place some insulating tape on your Pro Micro**. It shouldn’t be needed, because theres nothing really conductive there, but better safe than sorry. Then put your OLED in place and check if everything is where it should be. And yes, you want display of the module facing up 🤪.

![image](images/17.jpeg#layoutTextWidth)


—   
🤔 **Advice:** If you have a OLED cover it might be a good idea to check now if it will fit. It will be easier to replace or shorten the pins now.  
 —

If everything is in place press gently in the middle of the display with your finger and make sure it’s in place and positioned horizontally to the Pro Micro. It might be a bit hard to level it as it has some outstanding components at the bottom. Just do one pin first and check it it’s correct. Then apply some flux and solder rest of the pins.

### Test OLEDs and LEDs

**Temperature: None  
Difficulty: easy**

We’re almost done, but now is a good moment to test what we already have. Theres a chance that some LEDs won’t be lightening up, and now it’s a bit easier to fix them than when we have everything in place.

If you have not flashed your controllers, now is the time to do this. Just follow the “**_Programming Pro Micros (optional)”_** section and instead of shortening pins on the board press the reset button on the PCB. Remember, that you have to flash **both halves** of the keyboard.

After flashing disconnect USB, connect both sides of the keyboard with TRRS cable (always do it **before** you connect your keyboard via USB, this cable has no protection and can short circuit the controller while being inserted or removed) and connect the USB cable. Your keyboard should lighten up. You should see a layer indicator and a keylogger on left half and a Corne logo on the right one. Also all the LEDs should be glowing in red.

![image](images/18.jpeg#layoutTextWidth)


As you can see. I have messed up some LEDs on the left half. Don’t worry, it’s easy to fix. If you also got something messed up, check the “**_Troubleshooting”_** section.

—   
🤔 **Advice:** Use a magnetic connector on the Pro Micro USB. Its socket is really fragile. It usually breaks, does it pretty soon and desoldering a Pro Micro is a pain in the a** as you already know.  
 —

### Case and switches

**Temperature: None  
Difficulty: easy  
How hard to fix: easy**

If you have a case, now is the moment to assemble it. If your case is similar to mine, then first assembly the top part and connect all the switches. Test if they all work. If not — check the “**_Troubleshooting”_** section.

![image](images/19.jpeg#layoutTextWidth)


—   
🤔 **Advice:** There are two ways to insert the switches. First is to insert 4 switches into corners of the case, put it into the board, screw the case and then insert others one by one. It usually works great, but with Corne it worked better for me to just insert all switches into the case and connect them all at once. YMMW, just try it out.  
 —

When you have all your switches in and your case assembled, just insert your keycaps. You’re done.

### The end

Now you should have a fully functional keyboard. If something doesn’t work check the “**_Troubleshooting”_** section at the end. I hope it was a fun journey. You can check out [QMK](https://qmk.fm/) firmware page to start customizing your layout or firmware.

### Troubleshooting

#### Some LEDs are not glowing or are not red

If one or more LEDs is totally dark, then probably you have an unsoldered leg on the first one that is not glowing or on the previous one. LEDs are connected in series — previous one is powering next. So there are only 2 to check. The same is for LEDs that have different color than the rest. You only need to check faulty one or the previous. Unfortunately numbers on the PCB are not the same as the connection sequence. Check one of the pictures below from the Foostan guide to see the connection ordering:

[Per-key left part](https://user-images.githubusercontent.com/736191/54487452-7b955c80-48d9-11e9-98f7-87490a584274.png)

[Per-key right part](https://user-images.githubusercontent.com/736191/54487455-7b955c80-48d9-11e9-9498-c841747c5dbc.png)

For underglow you just need to guess or consult the schematics. But there’s only 6 of those, so it won’t be hard. If no under-key LED is working, check either the first one or last underglow LED.

First check for soldering issues. Maybe one of connections looks bad. If you think that soldering is fine replace the LED. It might be overheated or faulty.

#### No LED is glowing

This can be one of 4 problems. In order of probability:

* You have disabled LEDs by using a keyboard shortcut. Check keymap for combination to turn them on again.
* You have flashed firmware without LED support. Check that you have `RGBLIGHT_ENABLE = yes` in `rules.mk` file for your keymap and check for `define DISABLE_RGB_MATRIX_ALPHAS_MODS` lines in `config.h`. Re-flash and check again.
* LED no. 1 is not soldered correctly or broken. Check soldering on LED number 1. If it’s all good, replace the LED.
* You have an unsoldered pin in your Pro Micro. Check all connections of Pro Micro. Maybe theres a pin that looks bad.

#### One of the buttons is not working

It can be one of following, check in following order:

* It’s mapped to some modifier key in firmware. Check keymap.
* Switch is not fully in the socket. Check if it’s touching the PCB.
* One of the switch legs is bent. Remove the switch and straighten the leg.
* Diode on the switch is soldered incorrectly. Make sure it’s in the same direction as rest of the diodes. If not desolder the diode and solder it back correctly.
* Hot-swap socket is soldered badly. Re-solder.
* Switch is faulty, try another switch.
* Hotswap socket is either faulty or you have overheated it. Desolder and replace.
* Diode is faulty, desolder and replace.

#### Whole row or column of the keys is not working

You have a bad connection on the microcontroller. Check soldering on Pro Micro. Or you have messed up all the diodes on the row. Second one should be easy to spot.

#### Keyboard is not recognized in the OS

You have messed up firmware flashing or have a faulty Pro Micro. Start by reprogramming your controllers.

#### My keyboard halves are mixed

If you’re pressing a button that should be on your left hand, but it is on the right and vice-versa, it means that you have connected wrong half to the USB. Unplug cable from the side it is in and plug it into the second half. You can also change firmware settings and re-flash if you want to keep cable in the current half.
