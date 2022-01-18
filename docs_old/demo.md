# Demonstration of AnkiBridge

## Math using MathJax

#anki/start
The _Poisson Bracket_ of the functions $f$ and $g$ is defined as:
#anki/---
$$
\qty{f, g} ≝ \pdv{f}{q_i}\pdv{g}{p_i} - \pdv{f}{p_i}\pdv{g}{q_i}
$$
#anki/end

## Custom deck and tags
#anki/start
```anki
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
	\quad \text{where }{k_n = \frac{nπx}{L}} \quad😀
\end{gather}
$$ 
#anki/end

## Delete a note

#anki/start
```anki
# delete: true  # Uncomment this to delete the note
```
[[Iso processes|Isochoric]] heat capacity
#anki/---
$$
C_V = \pdv{U}{T} \Bigg |_V
$$

For an [[Ideal Gas]]:
$$
C_V = \frac{nR}{γ-1}
$$
#anki/end

## Disabled note
#anki/start
```anki
enabled: false
```
[[Iso processes|Isobaric]] heat capacity:
#anki/---
$$
C_P = \pdv{U}{T} \Bigg |_P
$$

For an [[Ideal Gas]]:
$$
C_P = γ \frac{nR}{γ - 1} = γ C_V
$$
#anki/end
