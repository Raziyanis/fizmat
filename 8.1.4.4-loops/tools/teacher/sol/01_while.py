n = int(input())
s = 0
if n >= 1:
    i = 1
    while i <= n:
        s = s + i
        i = i + 1
else:                          # N может быть меньше 1
    i = n
    while i <= 1:
        s = s + i
        i = i + 1
print(s)
