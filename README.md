<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />


# SOC Somanu Oru Chaya 

## Basic Details
### Team Name: Grove Street


### Team Members
- Team Lead: Aravind R - NSSCE
- Member 2: Arjun M L - NSSCE

### Project Description
Soman Chettan is a middle-aged man with very specific opinions about tea.

He doesn't want *just tea*.

He wants **അടിച്ച് പതപ്പിച്ച ചായ**.

And not everyone is worthy of making it.

**SOMAN ORU CHAYA** is an interactive tea-making simulator where the player has to prepare a cup of tea to satisfy Soman Chettan by performing the sacred art of **Chaya Adi** using hand gestures.

The game uses the player's webcam and **MediaPipe Hand Landmarker** to turn their hands into the primary controller.

You move the boiler.

You pour the milk and water.

You add tea powder and sugar.

You perform the Chaya Adi.

And finally...

**Soman judges you.**

---


### The Problem (that doesn't exist)
Soman chettan needs an അടിച്ച് പതപ്പിച്ച chaya, which can only be achived by the true legends of the tea making communities of kerala. Without this he cannot start his day...

### The Solution (that nobody asked for)
You can take innitiative and LITERALLY make the adicha chaya yourself

## Technical Details
### Technologies/Components Used
For Software:
- JavaScript
- React
- Tailwind CSS
- MediaPipe Hand Landmarker
- Hand Landmarker model: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
- Vite and npm

### Implementation
For Software:
# Installation
```bash
npm install
```

# Run
```bash
npm run dev
```

### Project Documentation

## 1. Overview

**SOMAN ORU CHAYA** is an interactive web-based tea-making simulator created as part of the **TinkerHub Useless Projects** make-athon.

The project puts the player in the role of a tea-shop worker who has to prepare a cup of tea according to the highly specific requirements of **Soman Chettan**.

What makes the project different is that the player does not control the game using a traditional keyboard or mouse. Instead, the player's **webcam and hand movements** are used as the primary input through **MediaPipe Hand Landmarker**.

The game combines computer vision, gesture-based interaction, virtual objects, pouring mechanics, and game logic to turn the simple act of making tea into an unnecessarily complicated digital experience.

---

## 2. Game Objective

The objective of the game is simple:

> **Make Soman Chettan the exact chaya he asked for.**

At the beginning of the game, Soman gives the player a specific tea requirement. The player must then prepare the tea while maintaining the correct ingredient quantities and avoiding unnecessary spillage.

The final tea is evaluated based on the player's performance throughout the preparation process.

---

## 3. Gameplay Flow

The game is divided into 3 game stages and finak cutscene.

### Stage 1 — Soman Chettan's Order

Soman Chettan is a pretty pecurilar man and he likes his tea sweet and simple with lots of pada which we get by tossing from one chaya glass to another.

---

### Stage 2 — Milk + Water

The player begins preparing the tea by adding the milk water. Which eventually becomes tea when we add chayapodi

The webcam tracks the player's hand using **MediaPipe Hand Landmarker**.

The player can:

1. Detect and grab the virtual boiler.
2. Move to the boiler using their hand.
3. Glass gets filled with milk water.

---

### Stage 3 — Tea Powder + Sugar

The player then adds tea powder and sugar.

The quantities need to match Soman's requirements.

For example:

* **Sugar addded ugar** makes him happy and gives you 3 extra points.
* **Tea power added** only then shall he allow you to give him his tea.

The ingredient quantities are stored as part of the tea's state and are later used during the final evaluation.

---

### Stage 4 — Chaya Adi

This is the main interaction of the game.

Once the tea is prepared, the player has to perform **Chaya Adi**, the traditional process of pouring tea between glasses.

Two virtual glasses are controlled using the player's hands.

The player's hand position and orientation determine the position and rotation of the glasses.

The player has to tilt one glass towards the other and pour the tea.

#### Successful Pour

When the tea particles reach the target glass, the tea is successfully transferred.

#### Failed Pour

If the player aims incorrectly, the tea misses the target glass and is spilled.

The amount of tea successfully retained is tracked throughout the process.

If too much tea is lost:

> **ELIMINATED AND RESET TO FRAME 1**

The player has to restart the game.

---

### Stage 5 — Soman's Taste Test

After successfully preparing the tea, Soman receives the final cup.

He drinks the tea and evaluates it.

The evaluation takes into account:

* Sugar added or not
* Chaya Adi performance or the number of pours from one cup to anotehr.

The player's performance in each stage contributes to the final outcome.

---

### Stage 6 — Final Result

Soman gives one of three possible reactions.

#### 👍 Thumbs Up

> **"Ithaanu chaya."**

The tea matches his expectations.

**Result: SUCCESS**

---

#### ✋ Neutral

> **"Kuzhappam illa."**

The tea is acceptable, but nothing special.

**Result: AVERAGE**

---

#### 😡 Angry

> **"Ithu chaya aano?"**

The tea fails to meet his expectations.

Soman throws the tea away and leaves.

**Result: FAILURE**

---

# 4. Computer Vision Implementation

The core interaction system uses **MediaPipe Hand Landmarker**.

The webcam provides a continuous video stream which is processed to identify hand landmarks.

The simplified processing pipeline is:

```text
Webcam
   ↓
Video Frame
   ↓
MediaPipe Hand Landmarker
   ↓
Hand Landmarks
   ↓
Hand Position & Orientation
   ↓
Interaction Detection
   ↓
Virtual Object Movement
```

The detected landmarks are used to determine where the player's hand is and how it is oriented.

This information is then mapped to virtual objects in the game.

---

# 5. Hand-Based Object Interaction

The same hand-tracking system is used for different interactions throughout the game.

### Boiler Interaction

The player can use their hand and automatically add milk..

```text
Hand Detection
      ↓
Boiler Position
      ↓
Move Boiler
      ↓
Position Over Glass
      ↓
Pour
```

### Glass Interaction

During Chaya Adi, the player's hands control the virtual glasses.

```text
Hand Position
      ↓
Glass Position

Hand Orientation
      ↓
Glass Rotation
```

This makes the pouring process depend directly on the player's physical hand movement.

---

# 6. Tea Pouring System

The Chaya Adi stage uses a particle-based tea simulation.

When a glass is tilted sufficiently, tea particles are generated from the source glass.

Each particle is given properties such as:

* Position
* Velocity
* Radius
* Lifetime
* Target glass
* Tea quantity

The particles are then animated through the air.

A simplified representation is:

```text
SOURCE GLASS
     │
     │
     │  •
     │   •
     │    •
     │     •
     ▼
TARGET GLASS
```

The particle movement includes gravity-like behaviour to create a more natural pouring effect.

---

# 7. Tea Transfer and Spillage

Each tea particle is checked against the target glass.

### If the particle reaches the target:

```text
Particle
   ↓
Target Collision
   ↓
Tea Retained
   ↓
Target Glass Volume ↑
```

### If the particle misses:

```text
Particle
   ↓
Misses Target
   ↓
Tea Spilled
   ↓
Tea Retention ↓
```

This creates a direct relationship between the player's hand accuracy and the amount of tea that survives the Chaya Adi.

---

# 8. Tea State Management

The game maintains the state of the tea throughout the preparation process.

Important values include:

* Milk quantity
* Water quantity
* Tea powder quantity
* Sugar quantity
* Tea volume
* Tea retained after pouring
* Pouring performance

The final evaluation uses these values to determine how closely the player's tea matches Soman's requested tea.

---

# 9. Glass Visualisation

The tea glasses have multiple visual states based on their tea level.

```text
        Tea Level

           FULL
            ↑
           HALF
            ↑
            LOW
            ↑
          EMPTY
```

The corresponding visual assets are switched according to the current tea volume.

This allows the player to visually understand how much tea is present in each glass during the game.

---

# 10. Overall System Architecture

```text
                    ┌──────────────┐
                    │    Webcam    │
                    └──────┬───────┘
                           │
                           ▼
                ┌────────────────────┐
                │ MediaPipe Hand     │
                │     Landmarker     │
                └─────────┬──────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Hand Landmarks  │
                 └────────┬────────┘
                          │
                 ┌────────┴─────────┐
                 │                  │
                 ▼                  ▼
          Hand Position       Hand Orientation
                 │                  │
                 ▼                  ▼
          Object Movement      Object Rotation
                 │                  │
                 └────────┬─────────┘
                          ▼
                 ┌─────────────────┐
                 │ Gameplay Logic  │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Boiler       Ingredients   Chaya Adi
             │            │            │
             └────────────┼────────────┘
                          ▼
                  ┌───────────────┐
                  │  Tea State    │
                  └───────┬───────┘
                          ▼
                  ┌───────────────┐
                  │ Taste Testing │
                  └───────┬───────┘
                          ▼
                 ┌──────────────────┐
                 │ Soman's Verdict  │
                 └──────────────────┘
```

---

# 11. Technologies Used

### Frontend

* React
* JavaScript
* Tailwind CSS
* Vite

### Computer Vision

* MediaPipe Hand Landmarker
* MediaPipe Tasks Vision

### Browser Technologies

* Webcam / `getUserMedia`
* HTML Canvas
* JavaScript animation
* SVG graphics

---

# 12. Key Features

* Real-time webcam hand tracking
* Gesture-based object interaction
* Virtual boiler control
* Milk/water pouring
* Tea powder and sugar management
* Two-hand tea glass interaction
* Chaya Adi simulation
* Tea particle animation
* Tea transfer detection
* Tea spillage detection
* Ingredient-based evaluation
* Multiple final outcomes
* Interactive customer feedback

---

# 13. Design Philosophy

The project intentionally combines a technically sophisticated implementation with an intentionally useless objective.

Making tea normally requires very little technology.

Our implementation requires:

```text
Webcam
   ↓
Computer Vision
   ↓
Hand Landmark Detection
   ↓
Gesture Processing
   ↓
Virtual Object Tracking
   ↓
Particle Simulation
   ↓
Collision Detection
   ↓
Tea State Management
   ↓
Customer Evaluation
```

All of this technology exists to answer one extremely important question:

> **"Is this chaya good enough for Soman Chettan?"**

---

# 14. Conclusion

**SOMAN ORU CHAYA** turns a simple everyday activity into an interactive computer-vision experience.

The project demonstrates how technologies such as real-time hand tracking, browser-based computer vision, canvas rendering, and particle animation can be combined to create an unusual form of human-computer interaction.

The result is intentionally unnecessary, but technically meaningful.

The player isn't saving the world.

They aren't defeating a boss.

They are simply trying to make one man a cup of tea.

And somehow, that's stressful enough.

### ☕ Make the chaya. Perform the adi. Survive Soman.


# Screenshots (Add at least 3)
![Interface](https://github.com/arjc/useless_project_grove_street/blob/main/public/Interface.png)
*Touch free interface allows the users to make Soman chettan a chaaya with ease yet some skill required unless you are a pro member of the kerala chaya adikkal committy*

![Pouring demo](https://github.com/arjc/useless_project_grove_street/blob/main/public/pouring.png)
*Demonstration how we can pour chaaya from one filled glass to another*

![Soman Collage](https://github.com/arjc/useless_project_grove_street/blob/main/public/soman.png)
*Final result on how Soman chettan will react to your chaaya*

# Diagrams
```text
                    ┌──────────────┐
                    │    Webcam    │
                    └──────┬───────┘
                           │
                           ▼
                ┌────────────────────┐
                │ MediaPipe Hand     │
                │     Landmarker     │
                └─────────┬──────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Hand Landmarks  │
                 └────────┬────────┘
                          │
                 ┌────────┴─────────┐
                 │                  │
                 ▼                  ▼
          Hand Position       Hand Orientation
                 │                  │
                 ▼                  ▼
          Object Movement      Object Rotation
                 │                  │
                 └────────┬─────────┘
                          ▼
                 ┌─────────────────┐
                 │ Gameplay Logic  │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Boiler       Ingredients   Chaya Adi
             │            │            │
             └────────────┼────────────┘
                          ▼
                  ┌───────────────┐
                  │  Tea State    │
                  └───────┬───────┘
                          ▼
                  ┌───────────────┐
                  │ Taste Testing │
                  └───────┬───────┘
                          ▼
                 ┌──────────────────┐
                 │ Soman's Verdict  │
                 └──────────────────┘
```



### Project Demo
# Video
[Drive link Video Demonstrating how we use the project to make a chaya for Soman chettan](https://drive.google.com/file/d/1GPLAoozh_aGafN80KGEWJ3hAYVx5TsE7/view?usp=sharing)
*PRoject deomnstration on how we can make a chaya for Soman chettan*


## Team Contributions
- Arjun ML: Web Developer, Game Developer
- Aravind R: 3D Graphics, 2D Assets, Documentation, Ideation

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)