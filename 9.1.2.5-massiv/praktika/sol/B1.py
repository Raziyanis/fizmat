a = list(map(int, input().split()))
k = 0
s = 0
for x in a:
    if x % 2 == 0:
        k = k + 1
        s = s + x
print(k, s)
