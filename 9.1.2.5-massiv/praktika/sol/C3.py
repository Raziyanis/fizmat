a = list(map(int, input().split()))
b = list(map(int, input().split()))
c = []
for x in a:
    if x in b and x not in c:
        c.append(x)
print(c)
