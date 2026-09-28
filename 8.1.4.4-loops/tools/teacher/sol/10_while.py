n = int(input())
a = 2
found = False
while not found:
    b = n - a
    d = 2
    while a % d != 0:          # наименьший делитель a
        d = d + 1
    e = 2
    while b % e != 0:          # наименьший делитель b
        e = e + 1
    if d == a and e == b:      # оба числа простые
        print(a, b)
        found = True
    a = a + 1
