n = int(input())
a = list(map(int, input().split()))
s = 0
k = 0
while k < n:
    if a[k] > 0:
        s = s + a[k]
    k = k + 1
i = a.index(min(a))
j = a.index(max(a))
if i > j:
    i, j = j, i
p = 1
k = i + 1
while k < j:
    p = p * a[k]
    k = k + 1
print(s, p)
