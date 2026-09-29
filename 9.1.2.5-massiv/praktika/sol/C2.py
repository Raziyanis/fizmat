a = list(map(int, input().split()))
b = []
i = len(a) - 1
while i >= 0:
    b.append(a[i])
    i = i - 1
print(b)
