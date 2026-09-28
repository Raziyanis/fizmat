n = int(input())
p = 1
for k in range(31):            # 2 в степени 30 уже больше 10⁹
    if p > n:
        break
    print(p, end=' ')
    p = p * 2
