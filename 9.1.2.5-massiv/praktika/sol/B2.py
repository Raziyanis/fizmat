a = list(map(int, input().split()))
x = int(input())
while x in a:
    a.remove(x)
print(a)
