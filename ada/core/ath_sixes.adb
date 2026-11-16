with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;
with Interfaces;

package body Ath_Sixes is
   use type Interfaces.Integer_32;
   type Bits is mod 2 ** 64;
   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   Stored_Faces : array (1 .. Die_Count) of Interfaces.Integer_32 := (others => 1);
   Stored_Sixes : Interfaces.Integer_32 := 0;

   function Log (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Log (Value);
   end Log;

   function Exp (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Exp (Value);
   end Exp;

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits := (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Unit (Index : Positive) return Long_Float is
      use type Interfaces.Unsigned_64;
      X : Interfaces.Unsigned_64 :=
        Interfaces.Unsigned_64 (Index) * 16#9E37_79B9_7F4A_7C15#;
   begin
      X := X xor Interfaces.Shift_Right (X, 30);
      X := X * 16#BF58_476D_1CE4_E5B9#;
      X := X xor Interfaces.Shift_Right (X, 27);
      X := X * 16#94D0_49BB_1331_11EB#;
      X := X xor Interfaces.Shift_Right (X, 31);
      return Long_Float (X and 16#1F_FFFF_FFFF_FFFF#) / (2.0 ** 53);
   end Unit;

   function Log1p (X : Long_Float) return Long_Float is
   begin
      if abs (X) < 1.0e-4 then
         return X - X * X / 2.0 + X * X * X / 3.0 - X * X * X * X / 4.0;
      end if;
      return Log (1.0 + X);
   end Log1p;

   function Expm1 (X : Long_Float) return Long_Float is
   begin
      if abs (X) < 1.0e-4 then
         return X + X * X / 2.0 + X * X * X / 6.0;
      end if;
      return Exp (X) - 1.0;
   end Expm1;

   function Single_Chance return Long_Float is
   begin
      return Exp (-Long_Float (Die_Count) * Log (6.0));
   end Single_Chance;

   function Egg_Single return Long_Float is
   begin
      return Egg_Adults / Egg_Count;
   end Egg_Single;

   function Expected_Winners (Players : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Players) or else Players <= 0.0 then
         return 0.0;
      end if;
      return Players * Single_Chance;
   end Expected_Winners;

   function Crowd_Group (Players : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Players) or else Players <= 0.0 then
         return 0.0;
      end if;
      return Players / Long_Float (Crowd_Count);
   end Crowd_Group;

   function Crowd_Marked (Index : Positive; Players : Long_Float) return Boolean is
      Chance : Long_Float;
      Status : Status_Code;
   begin
      if Index < 1 or else Index > Crowd_Count then
         return False;
      end if;
      At_Least_One (Crowd_Group (Players), Single_Chance, Chance, Status);
      if Status /= Ok then
         return False;
      end if;
      return Unit (20_000 + Index) < Chance;
   end Crowd_Marked;

   function Throws_Until (Draw : Positive) return Long_Float is
      Sample : Long_Float := Unit (80_000 + Draw);
      Span : Long_Float;
   begin
      if Sample < 1.0e-12 then
         Sample := 1.0e-12;
      end if;
      Span := Log (Sample) / Log1p (-Single_Chance);
      if Span < 1.0 then
         return 1.0;
      end if;
      return Long_Float'Ceiling (Span);
   end Throws_Until;

   function Ladder_Players (Index : Positive) return Long_Float is
   begin
      case Index is
         when 1 => return 1.0;
         when 2 => return 1.0e3;
         when 3 => return 1.0e6;
         when 4 => return 6.0e7;
         when others => return Player_Max;
      end case;
   end Ladder_Players;

   function Word (Chance : Long_Float) return Interfaces.Integer_32 is
   begin
      if not Is_Finite (Chance) or else Chance < 0.2 then
         return 0;
      elsif Chance < 0.8 then
         return 1;
      else
         return 2;
      end if;
   end Word;

   procedure At_Least_One
     (Trials : Long_Float;
      Single : Long_Float;
      Chance : out Long_Float;
      Status : out Status_Code) is
      Term : Long_Float;
   begin
      Chance := 0.0;
      if not Is_Finite (Trials) or else not Is_Finite (Single) then
         Status := Non_Finite;
         return;
      end if;
      if Trials < 0.0 then
         Status := Negative;
         return;
      end if;
      if Single < 0.0 or else Single > 1.0 then
         Status := Bad_Single;
         return;
      end if;
      if Trials = 0.0 or else Single = 0.0 then
         Status := Ok;
         return;
      end if;
      if Single = 1.0 then
         Chance := 1.0;
         Status := Ok;
         return;
      end if;
      Term := Trials * Log1p (-Single);
      if Term < -80.0 then
         Chance := 1.0;
      else
         Chance := -Expm1 (Term);
      end if;
      Status := Ok;
   end At_Least_One;

   function Scale
     (Slider, Low, High : Long_Float) return Long_Float is
      Phase : Long_Float := Slider;
   begin
      if not Is_Finite (Phase) then
         return Low;
      end if;
      if Phase < 0.0 then
         Phase := 0.0;
      elsif Phase > 1.0 then
         Phase := 1.0;
      end if;
      return Low * Exp (Phase * Log (High / Low));
   end Scale;

   function Unscale
     (Value, Low, High : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Value) or else Value <= Low then
         return 0.0;
      end if;
      if Value >= High then
         return 1.0;
      end if;
      return Log (Value / Low) / Log (High / Low);
   end Unscale;

   function Players_Of (Slider : Long_Float) return Long_Float is
   begin
      return Scale (Slider, Player_Min, Player_Max);
   end Players_Of;

   function Slider_Of_Players (Players : Long_Float) return Long_Float is
   begin
      return Unscale (Players, Player_Min, Player_Max);
   end Slider_Of_Players;

   function Eggs_Of (Slider : Long_Float) return Long_Float is
   begin
      return Scale (Slider, Egg_Min, Egg_Max);
   end Eggs_Of;

   function Slider_Of_Eggs (Eggs : Long_Float) return Long_Float is
   begin
      return Unscale (Eggs, Egg_Min, Egg_Max);
   end Slider_Of_Eggs;

   function Caption (Chance : Long_Float) return Interfaces.Integer_32 is
   begin
      if not Is_Finite (Chance) or else Chance < 0.01 then
         return Caption_Rare;
      elsif Chance < 0.5 then
         return Caption_Unlikely;
      elsif Chance < 0.99 then
         return Caption_Possible;
      else
         return Caption_Sure;
      end if;
   end Caption;

   procedure Fill
     (Low, High, Single : Long_Float;
      Amount, Chance, X_Pos : out Sample_Values) is
      Phase : Long_Float;
      Status : Status_Code;
   begin
      for Index in 1 .. Sample_Count loop
         Phase := Long_Float (Index - 1) / Long_Float (Sample_Count - 1);
         Amount (Index) := Scale (Phase, Low, High);
         At_Least_One (Amount (Index), Single, Chance (Index), Status);
         X_Pos (Index) := Phase;
      end loop;
   end Fill;

   procedure Player_Samples
     (Trials : out Sample_Values;
      Chance : out Sample_Values;
      X_Pos  : out Sample_Values) is
   begin
      Fill (Player_Min, Player_Max, Single_Chance, Trials, Chance, X_Pos);
   end Player_Samples;

   procedure Egg_Samples
     (Eggs   : out Sample_Values;
      Chance : out Sample_Values;
      Expect : out Sample_Values;
      X_Pos  : out Sample_Values) is
      Single : constant Long_Float := Egg_Single;
   begin
      Fill (Egg_Min, Egg_Max, Single, Eggs, Chance, X_Pos);
      for Index in 1 .. Sample_Count loop
         Expect (Index) := Eggs (Index) * Single;
      end loop;
   end Egg_Samples;

   procedure Roll (Set_Index : Positive) is
      Draw : Long_Float;
      Face_Value : Integer;
   begin
      Stored_Sixes := 0;
      for Die in 1 .. Die_Count loop
         Draw := Unit (Set_Index * 16 + Die);
         Face_Value := Integer (Long_Float'Floor (Draw * 6.0)) + 1;
         if Face_Value < 1 then
            Face_Value := 1;
         elsif Face_Value > 6 then
            Face_Value := 6;
         end if;
         Stored_Faces (Die) := Interfaces.Integer_32 (Face_Value);
         if Face_Value = 6 then
            Stored_Sixes := Stored_Sixes + 1;
         end if;
      end loop;
   end Roll;

   function Face (Die : Positive) return Interfaces.Integer_32 is
   begin
      if Die < 1 or else Die > Die_Count then
         return 0;
      end if;
      return Stored_Faces (Die);
   end Face;

   function Six_Count return Interfaces.Integer_32 is
   begin
      return Stored_Sixes;
   end Six_Count;
end Ath_Sixes;
