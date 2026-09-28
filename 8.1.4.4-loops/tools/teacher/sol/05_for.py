n = int(input())
for d in range(2, n + 1):
    if n % d == 0:
        print(d)
        break
