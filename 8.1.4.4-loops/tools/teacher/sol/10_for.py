n = int(input())
for a in range(2, n):
    b = n - a
    a_prime = True
    for d in range(2, a):
        if a % d == 0:
            a_prime = False
    b_prime = True
    for d in range(2, b):
        if b % d == 0:
            b_prime = False
    if a_prime and b_prime:
        print(a, b)
        break
