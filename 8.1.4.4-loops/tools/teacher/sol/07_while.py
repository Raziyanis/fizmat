s, p = map(int, input().split())
x = 1
while x * (s - x) != p or x > s - x:
    x = x + 1
print(x, s - x)
