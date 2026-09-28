t = input()
best = 0
cur = 0
i = 0
while i < len(t):
    if t[i] == '0':
        cur = cur + 1
        if cur > best:
            best = cur
    else:
        cur = 0
    i = i + 1
print(best)
