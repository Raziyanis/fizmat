a = list(map(int, input().split()))
b = []
for x in a:
    if x not in b:
        b.append(x)
print(b)
