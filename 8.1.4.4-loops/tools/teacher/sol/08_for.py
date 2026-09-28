t = input()
best = 0
cur = 0
for c in t:
    if c == '0':
        cur = cur + 1
        if cur > best:
            best = cur
    else:
        cur = 0
print(best)
