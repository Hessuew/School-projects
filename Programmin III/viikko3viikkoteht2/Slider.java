
package viikko3viikkoteht2;

public class Slider extends Komponentti{
    private int min;
    private int max;
    private int val;

    public Slider(int min, int max, int val) {
        this.min = min;
        this.max = max;
        this.val = val;
    }

public int getMin() {
        return min;

   }

    public int getMax() {
        return max;
    }

    public int getVal() {
        return val;
    }
}
  

