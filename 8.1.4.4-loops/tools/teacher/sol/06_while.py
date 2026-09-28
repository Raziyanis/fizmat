n = int(input())
a = list(map(int, input().split()))
mn = a[0]
mx = a[0]
i = 1
while i < n:
    if a[i] < mn:
        mn = a[i]
    if a[i] > mx:
        mx = a[i]
    i = i + 1
print(mn, mx)
