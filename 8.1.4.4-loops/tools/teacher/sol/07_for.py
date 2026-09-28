s, p = map(int, input().split())
for x in range(1, s):
    y = s - x
    if x <= y and x * y == p:
        print(x, y)
        break
