with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;
with Interfaces;

package body Ath_Lottery is
   use type Interfaces.Integer_32;
   use type Interfaces.Unsigned_64;

   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   Product_Limit : constant Long_Float := 8_192.0;
   Ln_Ten : constant Long_Float :=
     Ada.Numerics.Long_Elementary_Functions.Log (10.0);
   Two_Pi : constant Long_Float := 2.0 * Ada.Numerics.Pi;

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Is_Integer (Value : Long_Float) return Boolean is
   begin
      return Is_Finite (Value) and then Value = Long_Float'Truncation (Value);
   end Is_Integer;

   function Ln (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Log (Value);
   end Ln;

   function Stirling_Ln_Fact (N : Long_Float) return Long_Float is
   begin
      if N <= 1.0 then
         return 0.0;
      end if;
      return N * Ln (N) - N
        + 0.5 * Ln (Two_Pi * N)
        + 1.0 / (12.0 * N)
        - 1.0 / (360.0 * N ** 3)
        + 1.0 / (1_260.0 * N ** 5)
        - 1.0 / (1_680.0 * N ** 7);
   end Stirling_Ln_Fact;

   --  ln(High!) - ln(Low!), with High >= Low >= 0.
   function Ln_Factorial_Span (High, Low : Long_Float) return Long_Float is
      Gap : constant Long_Float := High - Low;
      Ln_Ratio : Long_Float;
   begin
      if Gap = 0.0 then
         return 0.0;
      end if;
      if Low <= 0.0 then
         return Stirling_Ln_Fact (High);
      end if;
      Ln_Ratio := Ln (High) - Ln (Low);
      return Gap * Ln (High) + Low * Ln_Ratio - Gap + 0.5 * Ln_Ratio
        - Gap / (12.0 * High * Low)
        - (1.0 / High ** 3 - 1.0 / Low ** 3) / 360.0
        + (1.0 / High ** 5 - 1.0 / Low ** 5) / 1_260.0
        - (1.0 / High ** 7 - 1.0 / Low ** 7) / 1_680.0;
   end Ln_Factorial_Span;

   function Log_Product
     (Numerator_Start, Denominator_Start, Count : Long_Float) return Long_Float is
      Sum : Long_Float := 0.0;
      Index : Long_Float := 0.0;
   begin
      while Index < Count loop
         Sum := Sum
           + Ln (Numerator_Start - Index)
           - Ln (Denominator_Start - Index);
         Index := Index + 1.0;
      end loop;
      return Sum;
   end Log_Product;

   procedure None_Log
     (Tickets, Prizes, Bought : Long_Float;
      Log_Value : out Long_Float;
      Exact_Zero : out Boolean) is
      Blanks : constant Long_Float := Tickets - Prizes;
      Steps : Long_Float;
   begin
      Exact_Zero := False;
      Log_Value := 0.0;
      if Bought = 0.0 or else Prizes = 0.0 then
         return;
      end if;
      if Bought > Blanks then
         Exact_Zero := True;
         return;
      end if;
      Steps := Long_Float'Min (Bought, Prizes);
      if Steps <= Product_Limit then
         if Bought <= Prizes then
            Log_Value := Log_Product (Blanks, Tickets, Bought);
         else
            Log_Value := Log_Product (Tickets - Bought, Tickets, Prizes);
         end if;
      else
         Log_Value :=
           Ln_Factorial_Span (Blanks, Blanks - Bought)
           - Ln_Factorial_Span (Tickets, Tickets - Bought);
      end if;
   end None_Log;

   function Gcd
     (Left, Right : Interfaces.Unsigned_64) return Interfaces.Unsigned_64 is
      A : Interfaces.Unsigned_64 := Left;
      B : Interfaces.Unsigned_64 := Right;
      Next : Interfaces.Unsigned_64;
   begin
      while B /= 0 loop
         Next := A mod B;
         A := B;
         B := Next;
      end loop;
      return A;
   end Gcd;

   procedure Try_Fraction
     (Tickets, Prizes, Bought : Long_Float;
      Num, Den : out Long_Float;
      Valid : out Boolean) is
      use type Interfaces.Unsigned_64;
      N : Interfaces.Unsigned_64 := 1;
      D : Interfaces.Unsigned_64 := 1;
      Steps : Long_Float;
      Use_Bought : Boolean;
      Index : Long_Float := 0.0;
   begin
      Num := 0.0;
      Den := 1.0;
      Valid := False;
      if Bought = 0.0 or else Prizes = 0.0 then
         Num := 1.0;
         Valid := True;
         return;
      end if;
      if Bought > Tickets - Prizes then
         Num := 0.0;
         Valid := True;
         return;
      end if;
      Steps := Long_Float'Min (Bought, Prizes);
      if Steps > 64.0 then
         return;
      end if;
      Use_Bought := Bought <= Prizes;
      while Index < Steps loop
         declare
            Factor_N : Interfaces.Unsigned_64;
            Factor_D : Interfaces.Unsigned_64;
            Divisor : Interfaces.Unsigned_64;
         begin
            if Use_Bought then
               Factor_N := Interfaces.Unsigned_64 (Tickets - Prizes - Index);
               Factor_D := Interfaces.Unsigned_64 (Tickets - Index);
            else
               Factor_N := Interfaces.Unsigned_64 (Tickets - Bought - Index);
               Factor_D := Interfaces.Unsigned_64 (Tickets - Index);
            end if;
            Divisor := Gcd (Factor_N, D);
            Factor_N := Factor_N / Divisor;
            D := D / Divisor;
            Divisor := Gcd (Factor_D, N);
            Factor_D := Factor_D / Divisor;
            N := N / Divisor;
            if Factor_N /= 0 and then N > Interfaces.Unsigned_64'Last / Factor_N then
               return;
            end if;
            if Factor_D /= 0 and then D > Interfaces.Unsigned_64'Last / Factor_D then
               return;
            end if;
            N := N * Factor_N;
            D := D * Factor_D;
         end;
         Index := Index + 1.0;
      end loop;
      if D = 0 then
         return;
      end if;
      declare
         Divisor : constant Interfaces.Unsigned_64 := Gcd (N, D);
      begin
         N := N / Divisor;
         D := D / Divisor;
      end;
      if Long_Float (N) > Max_Exact_Integer or else Long_Float (D) > Max_Exact_Integer then
         return;
      end if;
      Num := Long_Float (N);
      Den := Long_Float (D);
      Valid := True;
   end Try_Fraction;

   function Expected_Prizes (Tickets, Prizes, Bought : Long_Float) return Long_Float is
   begin
      if Bought = 0.0 or else Prizes = 0.0 then
         return 0.0;
      end if;
      if Bought = Tickets then
         return Prizes;
      end if;
      if Prizes <= Max_Exact_Integer / Bought then
         return (Bought * Prizes) / Tickets;
      end if;
      return (Bought / Tickets) * Prizes;
   end Expected_Prizes;

   procedure Evaluate
     (Tickets, Prizes, Bought : Long_Float;
      Expected, None_Value, None_Log10, At_Least : out Long_Float;
      None_Representable, None_Exact_Zero, At_Least_Exact : out Boolean;
      Kind : out Interfaces.Integer_32) is
      Log_Value : Long_Float;
      Exact_Zero : Boolean;
   begin
      Expected := Expected_Prizes (Tickets, Prizes, Bought);
      None_Log (Tickets, Prizes, Bought, Log_Value, Exact_Zero);
      None_Exact_Zero := Exact_Zero;
      if Exact_Zero then
         None_Value := 0.0;
         None_Log10 := 0.0;
         None_Representable := True;
         At_Least := 1.0;
         At_Least_Exact := True;
         Kind := Kind_Exact_Zero;
         return;
      end if;
      None_Log10 := Log_Value / Ln_Ten;
      if Log_Value < -700.0 then
         None_Value := 0.0;
         None_Representable := False;
         At_Least := 1.0;
         At_Least_Exact := False;
         Kind := Kind_Too_Small;
         return;
      end if;
      None_Value := Ada.Numerics.Long_Elementary_Functions.Exp (Log_Value);
      if not Is_Finite (None_Value) or else None_Value <= 0.0 then
         None_Value := 0.0;
         None_Representable := False;
         At_Least := 1.0;
         At_Least_Exact := False;
         Kind := Kind_Too_Small;
         return;
      end if;
      None_Representable := True;
      At_Least := 1.0 - None_Value;
      At_Least_Exact := At_Least /= 1.0 or else None_Value = 0.0;
      Kind := Kind_Drawable;
   end Evaluate;

   procedure Clear
     (Expected, None_Value, None_Log10, At_Least : out Long_Float;
      None_Representable, None_Exact_Zero, At_Least_Exact, Fraction_Valid : out Boolean;
      Fraction_Num, Fraction_Den : out Long_Float;
      Axis_X_Max, Expected_Max : out Long_Float;
      Sample_Used : out Interfaces.Integer_32;
      Bought_Out, Expected_Out, Chance_Out : out Sample_Values;
      Chance_Kind : out Sample_Kinds) is
   begin
      Expected := 0.0;
      None_Value := 0.0;
      None_Log10 := 0.0;
      At_Least := 0.0;
      None_Representable := False;
      None_Exact_Zero := False;
      At_Least_Exact := False;
      Fraction_Valid := False;
      Fraction_Num := 0.0;
      Fraction_Den := 1.0;
      Axis_X_Max := 0.0;
      Expected_Max := 0.0;
      Sample_Used := 0;
      Bought_Out := (others => 0.0);
      Expected_Out := (others => 0.0);
      Chance_Out := (others => 0.0);
      Chance_Kind := (others => Kind_Exact_Zero);
   end Clear;

   procedure Draw
     (Tickets, Prizes, Bought : Long_Float;
      Expected, None_Value, None_Log10, At_Least : out Long_Float;
      None_Representable, None_Exact_Zero, At_Least_Exact, Fraction_Valid : out Boolean;
      Fraction_Num, Fraction_Den : out Long_Float;
      Axis_X_Max, Expected_Max : out Long_Float;
      Sample_Used : out Interfaces.Integer_32;
      Bought_Out, Expected_Out, Chance_Out : out Sample_Values;
      Chance_Kind : out Sample_Kinds;
      Status : out Status_Code) is
      Kind : Interfaces.Integer_32;
      Used : Natural := 0;
   begin
      Clear
        (Expected, None_Value, None_Log10, At_Least,
         None_Representable, None_Exact_Zero, At_Least_Exact, Fraction_Valid,
         Fraction_Num, Fraction_Den, Axis_X_Max, Expected_Max, Sample_Used,
         Bought_Out, Expected_Out, Chance_Out, Chance_Kind);
      if not Is_Finite (Tickets) or else not Is_Finite (Prizes) or else not Is_Finite (Bought) then
         Status := Non_Finite_Input;
         return;
      end if;
      if not Is_Integer (Tickets) or else not Is_Integer (Prizes) or else not Is_Integer (Bought) then
         Status := Not_Integer;
         return;
      end if;
      if Tickets < 1.0 or else Tickets > Max_Exact_Integer
        or else Prizes > Max_Exact_Integer or else Bought > Max_Exact_Integer
      then
         if Tickets > Max_Exact_Integer or else Prizes > Max_Exact_Integer or else Bought > Max_Exact_Integer then
            Status := Out_Of_Range;
         else
            Status := Tickets_Not_Positive;
         end if;
         return;
      end if;
      if Prizes < 0.0 or else Prizes > Tickets then
         Status := Prizes_Out_Of_Range;
         return;
      end if;
      if Bought < 0.0 or else Bought > Tickets then
         Status := Bought_Out_Of_Range;
         return;
      end if;

      Evaluate
        (Tickets, Prizes, Bought,
         Expected, None_Value, None_Log10, At_Least,
         None_Representable, None_Exact_Zero, At_Least_Exact, Kind);
      Try_Fraction (Tickets, Prizes, Bought, Fraction_Num, Fraction_Den, Fraction_Valid);
      if Fraction_Valid then
         At_Least_Exact := True;
         if Fraction_Den /= 0.0 then
            At_Least := (Fraction_Den - Fraction_Num) / Fraction_Den;
            if not None_Exact_Zero then
               None_Value := Fraction_Num / Fraction_Den;
               None_Representable := True;
               Kind := Kind_Drawable;
            end if;
         end if;
      end if;

      Axis_X_Max := Tickets;
      Expected_Max := Prizes;
      declare
         Chosen : array (1 .. Sample_Count) of Long_Float := (others => -1.0);
         Count : Natural := 0;

         procedure Add_Sample (Value : Long_Float) is
            Item : Long_Float := Long_Float'Rounding (Value);
         begin
            if Item < 0.0 then
               Item := 0.0;
            elsif Item > Tickets then
               Item := Tickets;
            end if;
            for Index in 1 .. Count loop
               if Chosen (Index) = Item then
                  return;
               end if;
            end loop;
            if Count = Sample_Count then
               return;
            end if;
            Count := Count + 1;
            Chosen (Count) := Item;
         end Add_Sample;
      begin
         if Tickets + 1.0 <= Long_Float (Sample_Count) then
            for Offset in 0 .. Natural (Tickets) loop
               Add_Sample (Long_Float (Offset));
            end loop;
         else
            Add_Sample (0.0);
            Add_Sample (Tickets);
            Add_Sample (Bought);
            if Prizes > 0.0 then
               declare
                  Focus : constant array (1 .. 12) of Long_Float :=
                    (0.25, 0.5, 1.0, 2.0, 3.0, 4.0, 6.0, 8.0, 12.0, 20.0, 40.0, 80.0);
               begin
                  for Index in Focus'Range loop
                     Add_Sample (Focus (Index) * Tickets / Prizes);
                  end loop;
               end;
            end if;
            for Index in 1 .. Sample_Count loop
               Add_Sample (Tickets * Long_Float (Index - 1) / Long_Float (Sample_Count - 1));
            end loop;
         end if;
         for Left in 1 .. Count loop
            for Right in Left + 1 .. Count loop
               if Chosen (Right) < Chosen (Left) then
                  declare
                     Swap : constant Long_Float := Chosen (Left);
                  begin
                     Chosen (Left) := Chosen (Right);
                     Chosen (Right) := Swap;
                  end;
               end if;
            end loop;
         end loop;
         Used := Count;
         Sample_Used := Interfaces.Integer_32 (Used);
         for Index in 1 .. Used loop
            Bought_Out (Index) := Chosen (Index);
         end loop;
      end;
      for Index in 1 .. Used loop
         declare
            Sample_Bought : Long_Float := Bought_Out (Index);
            Sample_Expected : Long_Float;
            Sample_None : Long_Float;
            Sample_Log10 : Long_Float;
            Sample_At_Least : Long_Float;
            Sample_Representable : Boolean;
            Sample_Zero : Boolean;
            Sample_Exact : Boolean;
            Sample_Kind : Interfaces.Integer_32;
         begin
            Evaluate
              (Tickets, Prizes, Sample_Bought,
               Sample_Expected, Sample_None, Sample_Log10, Sample_At_Least,
               Sample_Representable, Sample_Zero, Sample_Exact, Sample_Kind);
            Bought_Out (Index) := Sample_Bought;
            Expected_Out (Index) := Sample_Expected;
            if Sample_Kind = Kind_Too_Small then
               Chance_Out (Index) := 0.0;
            else
               Chance_Out (Index) := Sample_None;
            end if;
            Chance_Kind (Index) := Sample_Kind;
         end;
      end loop;
      Status := Ok;
   end Draw;
end Ath_Lottery;
