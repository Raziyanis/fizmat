n = int(input())
a = list(map(int, input().split()))
s = 0
for x in a:
    if x > 0:
        s = s + x
i = a.index(min(a))
j = a.index(max(a))
if i > j:
    i, j = j, i
p = 1
for k in range(i + 1, j):
    p = p * a[k]
print(s, p)
