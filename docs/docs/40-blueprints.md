# 📘 Blueprints

**Blueprints** are the things **AnkiBridge** uses to scan for notes in
your vault.

Each blueprint describes how a note may be laid out in your Obsidian documents,
and fancy logic behind the scenes ensures that no _collisions_ between two blueprints
are possible.

Any individual blueprint can be enabled or disabled using the [settings](/settings) tab.

## 🥪 Sandwich

The sandwich blueprint is enclosed by `#anki/start` and `#anki/end` tags.
The front and back fields _sandwich_ a `#anki/---` tag.

The Sandwich blueprint was the first blueprint added and is generally inferior
to the [BasicCodeBlock blueprint](#-basiccodeblock).

!!!note Recommendation

I would recommend changing all Sandwich-style notes to the newer BasicCodeBlock-style

!!!

### Compatibility

| Mode         | Compatibility | Comment   |
| ------------ | :-----------: | --------- |
| Live Preview |      🟡      | Not great |
| Reading      |      ✔       |           |

### Example
````md
#anki/start
```anki-config
deck: Exams
tags:
  - math
  - fourier
```
How do you find the [[Test1|Fourier Coefficients]]?
A function with period $L$ can be written as a __Fourier Series__:
#anki/---
$$

\begin{gather}
	f(x) = \frac{1}{2} a_0 + ∑\limits_{n=1}^∞ a_n \cos(k_n x) + ∑\limits_{n=1}^∞ b_n \sin(k_n x)\\
	\\
	\quad \text{where }{k_n = \frac{nπx}{L}} \quad 😀
\end{gather}
$$ 
#anki/end
````

## 💻 BasicCodeBlock

### Compatibility

| Mode         | Compatibility | Comment |
| ------------ | :-----------: | ------- |
| Live Preview |      ✔       |         |
| Reading      |      ✔       |         |

TODO
